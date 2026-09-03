'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setEmail(session.user.email)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Password updated successfully.')
      setNewPassword('')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.'
    )
    if (!confirmed) return

    setMessage('Account deletion requires contacting support for now.')
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Account Settings</h1>
      <p style={{ color: '#666', marginTop: 8 }}>Logged in as: {email}</p>

      <form onSubmit={handlePasswordChange} style={{ marginTop: 32 }}>
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Update Password</button>
      </form>

      {message && <p style={{ marginTop: 16 }}>{message}</p>}

      <div style={{ marginTop: 48, borderTop: '1px solid #eee', paddingTop: 24 }}>
        <h3 style={{ color: '#c00' }}>Danger Zone</h3>
        <button
          onClick={handleDeleteAccount}
          style={{ padding: '8px 16px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4, marginTop: 8 }}
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}