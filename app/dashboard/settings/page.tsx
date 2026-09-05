'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [email, setEmail] = useState<string>('')
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
      setEmail(session.user.email ?? '')
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handlePasswordChange = async (e: React.FormEvent) => {
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

  if (loading) {
    return (
      <main className="profile-wrap">
        <p className="summary-hint">Loading...</p>
      </main>
    )
  }

  return (
    <main className="profile-wrap">
      <h1 className="section-title">Account settings</h1>
      <p className="profile-field-hint">Logged in as: {email}</p>

      <form onSubmit={handlePasswordChange} className="profile-form settings-password-form">
        <h3>Change password</h3>
        <div className="log-meal-field">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="log-meal-save-btn">
          Update password
        </button>
      </form>

      {message && <p className="profile-message">{message}</p>}

      <div className="settings-danger-zone">
        <h3>Danger zone</h3>
        <button onClick={handleDeleteAccount} className="settings-delete-btn">
          Delete account
        </button>
      </div>
    </main>
  )
}