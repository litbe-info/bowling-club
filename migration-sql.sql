-- 1. Add columns
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS receive_mailings BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_user_id ON club_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_approval_status ON club_members(approval_status);

-- 3. Allow member role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'receptionist', 'member'));

-- 4. RLS policies for members
DO $$ BEGIN CREATE POLICY "member_read_own" ON club_members FOR SELECT TO authenticated USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_update_own" ON club_members FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "member_read_own_qr" ON monthly_qr_codes FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM club_members WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Update generate function (approved only)
CREATE OR REPLACE FUNCTION generate_monthly_qr_codes(p_month INTEGER, p_year INTEGER)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $func$
DECLARE v_member_count INTEGER; v_generated_count INTEGER := 0;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_MONTH', 'message', 'Invalid month');
  END IF;
  SELECT COUNT(*) INTO v_member_count FROM club_members WHERE is_active = true AND approval_status = 'approved';
  INSERT INTO monthly_qr_codes (member_id, month, year, qr_code)
  SELECT id, p_month, p_year, gen_random_uuid()::TEXT
  FROM club_members WHERE is_active = true AND approval_status = 'approved'
  ON CONFLICT (member_id, month, year) DO NOTHING;
  GET DIAGNOSTICS v_generated_count = ROW_COUNT;
  RETURN json_build_object('success', true, 'total_members', v_member_count, 'codes_generated', v_generated_count, 'month', p_month, 'year', p_year);
END; $func$;
