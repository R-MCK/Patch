import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NotebookPen, Sprout } from 'lucide-react'
import PaperBackdrop from '@/redesign/components/PaperBackdrop'
import PaperCard from '@/redesign/components/PaperCard'
import { useAuthStore } from '@/stores/authStore'

const inputStyle = {
  width: '100%',
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  padding: '12px 14px',
  font: 'inherit',
  outlineColor: 'var(--forest)',
}

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    try {
      await register(email, password, name.trim() || undefined)
      navigate('/')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <PaperBackdrop
      variant="cream"
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: '32px 16px',
      }}
    >
      <main style={{ width: 'min(100%, 460px)' }}>
        <PaperCard className="book-frame" style={{ padding: '38px 32px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span className="chip">
              <Sprout size={14} />
              Patch
            </span>
            <span className="dotted-rule" style={{ flex: 1 }} />
          </div>

          <h1 className="font-display" style={{ fontSize: 44, lineHeight: 1, margin: 0 }}>
            Start a garden log
          </h1>
          <p style={{ color: 'var(--ink-soft)', margin: '10px 0 28px' }}>
            Create your account and keep the almanac close.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            {error && (
              <div role="alert" style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 12 }}>
                {error}
              </div>
            )}

            <label style={{ display: 'grid', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 13 }}>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                style={inputStyle}
                placeholder="Your name"
              />
            </label>

            <label style={{ display: 'grid', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 13 }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>

            <label style={{ display: 'grid', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 13 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={inputStyle}
                placeholder="At least 8 characters"
              />
            </label>

            <label style={{ display: 'grid', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 13 }}>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={inputStyle}
                placeholder="Repeat your password"
              />
            </label>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ justifyContent: 'center' }}>
              <NotebookPen size={16} />
              {isLoading ? 'Creating account' : 'Create account'}
            </button>
          </form>

          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '22px 0 0', textAlign: 'center' }}>
            Already registered?{' '}
            <Link to="/login" className="link-ink" style={{ color: 'var(--ink)' }}>
              Sign in
            </Link>
          </p>
        </PaperCard>
      </main>
    </PaperBackdrop>
  )
}
