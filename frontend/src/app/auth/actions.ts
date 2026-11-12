'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('fullName') as string,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  if (authData.user) {
    // Sync to Prisma Database (User table)
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          passwordHash: 'SUPABASE_AUTH_DELEGATED', // Placeholder
          role: 'CUSTOMER',
          status: 'ACTIVE',
          profile: {
            create: { fullName: data.options.data.full_name }
          }
        }
      })
    } catch (e) {
      console.error("Prisma Sync Error", e)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}
