-- =====================================================
-- Bowling Club - Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. club_members
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  birthday DATE,
  photo_url TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT phone_israeli_format CHECK (phone ~ '^05[0-9]{8}$')
);

CREATE INDEX idx_members_phone ON club_members(phone);
CREATE INDEX idx_members_active ON club_members(is_active) WHERE is_active = true;

-- 2. monthly_qr_codes
CREATE TABLE monthly_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2025),
  qr_code TEXT UNIQUE NOT NULL,
  qr_image_url TEXT,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by_user_id UUID REFERENCES auth.users(id),
  redeemed_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_member_month_year UNIQUE(member_id, month, year)
);

CREATE INDEX idx_qr_member ON monthly_qr_codes(member_id);
CREATE INDEX idx_qr_period ON monthly_qr_codes(month, year);
CREATE INDEX idx_qr_code_lookup ON monthly_qr_codes(qr_code) WHERE is_redeemed = false;
CREATE INDEX idx_qr_redeemed ON monthly_qr_codes(is_redeemed, redeemed_at);

-- 3. campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_sent INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_role UNIQUE(user_id)
);

CREATE INDEX idx_user_roles_lookup ON user_roles(user_id);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- club_members policies
CREATE POLICY "admin_all_access_members" ON club_members FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "receptionist_read_members" ON club_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('receptionist', 'admin')));

-- monthly_qr_codes policies
CREATE POLICY "admin_all_access_qr" ON monthly_qr_codes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "receptionist_read_qr" ON monthly_qr_codes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('receptionist', 'admin')));

CREATE POLICY "receptionist_update_redemption" ON monthly_qr_codes FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('receptionist', 'admin')))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('receptionist', 'admin')));

-- campaigns policies
CREATE POLICY "admin_only_campaigns" ON campaigns FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- user_roles policies
CREATE POLICY "read_own_role" ON user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_manage_roles" ON user_roles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- Functions
-- =====================================================

CREATE OR REPLACE FUNCTION redeem_qr_code(
  p_qr_code TEXT,
  p_redeemed_by_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr monthly_qr_codes%ROWTYPE;
  v_member club_members%ROWTYPE;
BEGIN
  SELECT * INTO v_qr FROM monthly_qr_codes WHERE qr_code = p_qr_code;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error_code', 'QR_NOT_FOUND',
      'message', 'ברקוד לא נמצא במערכת'
    );
  END IF;

  IF v_qr.is_redeemed THEN
    RETURN json_build_object(
      'success', false,
      'error_code', 'ALREADY_REDEEMED',
      'message', 'ברקוד כבר מומש',
      'redeemed_at', v_qr.redeemed_at,
      'redeemed_by', v_qr.redeemed_by_name
    );
  END IF;

  UPDATE monthly_qr_codes
  SET is_redeemed = true,
      redeemed_at = NOW(),
      redeemed_by_user_id = auth.uid(),
      redeemed_by_name = p_redeemed_by_name
  WHERE id = v_qr.id;

  UPDATE club_members
  SET total_redemptions = total_redemptions + 1
  WHERE id = v_qr.member_id
  RETURNING * INTO v_member;

  RETURN json_build_object(
    'success', true,
    'message', 'ברקוד מומש בהצלחה!',
    'member', json_build_object(
      'id', v_member.id,
      'name', v_member.full_name,
      'phone', v_member.phone,
      'email', v_member.email,
      'photo_url', v_member.photo_url,
      'total_redemptions', v_member.total_redemptions,
      'joined_at', v_member.joined_at
    ),
    'redeemed_at', NOW()
  );
END;
$$;

CREATE OR REPLACE FUNCTION generate_monthly_qr_codes(
  p_month INTEGER,
  p_year INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_count INTEGER;
  v_generated_count INTEGER := 0;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_MONTH',
      'message', 'חודש לא תקין'
    );
  END IF;

  SELECT COUNT(*) INTO v_member_count FROM club_members WHERE is_active = true;

  INSERT INTO monthly_qr_codes (member_id, month, year, qr_code)
  SELECT id, p_month, p_year, gen_random_uuid()::TEXT
  FROM club_members
  WHERE is_active = true
  ON CONFLICT (member_id, month, year) DO NOTHING;

  GET DIAGNOSTICS v_generated_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'total_members', v_member_count,
    'codes_generated', v_generated_count,
    'month', p_month,
    'year', p_year
  );
END;
$$;

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_members_timestamp
BEFORE UPDATE ON club_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Views
-- =====================================================

CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  month,
  year,
  COUNT(*) as total_codes_generated,
  COUNT(*) FILTER (WHERE is_redeemed = true) as total_redeemed,
  ROUND(
    (COUNT(*) FILTER (WHERE is_redeemed = true)::NUMERIC / COUNT(*)::NUMERIC) * 100,
    2
  ) as redemption_rate_percentage
FROM monthly_qr_codes
GROUP BY month, year
ORDER BY year DESC, month DESC;
