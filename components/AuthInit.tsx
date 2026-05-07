'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthInit() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        supabase.auth.signInAnonymously()
      }
    })
  }, [])
  return null
}
