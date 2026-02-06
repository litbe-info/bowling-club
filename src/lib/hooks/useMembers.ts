'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Member, MemberInsert, MemberUpdate } from '@/types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async (search?: string, filter?: 'all' | 'active' | 'inactive') => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('club_members')
        .select('*')
        .order('joined_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('is_active', true)
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת חברים')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = async (memberData: MemberInsert) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('club_members')
      .insert([memberData])
      .select()
      .single()

    if (!error && data) {
      setMembers((prev) => [data, ...prev])
    }

    return { data, error }
  }

  const updateMember = async (id: string, updates: MemberUpdate) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('club_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setMembers((prev) => prev.map((m) => (m.id === id ? data : m)))
    }

    return { data, error }
  }

  const deleteMember = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('id', id)

    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id))
    }

    return { error }
  }

  const getMember = async (id: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    getMember,
  }
}
