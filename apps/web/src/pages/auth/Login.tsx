import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Sprout } from 'lucide-react'
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

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
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
      <main style={{ width: 'min(100%, 430px)' }}>
        <PaperCard className="book-frame" style={{ padding: '38px 32px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span className="chip">
              <Sprout size={14} />
              Patch
            </span>
            <span className="dotted-rule" style={{ flex: 1 }} />
          </div>

          <h1 className="font-display" style={{ fontSize: 44, lineHeight: 1, margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--ink-soft)', margin: '10px 0 28px' }}>
            Sign in to tend your garden ledger.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            {error && (
              <div role="alert" style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 12 }}>
                {error}
              </div>
            )}

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
                autoComplete="current-password"
                style={inputStyle}
                placeholder="Your password"
              />
            </label>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ justifyContent: 'center' }}>
              <LogIn size={16} />
              {isLoading ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '22px 0 0', textAlign: 'center' }}>
            Need a Patch account?{' '}
            <Link to="/register" className="link-ink" style={{ color: 'var(--ink)' }}>
              Register
            </Link>
          </p>
        </PaperCard>
      </main>
    </PaperBackdrop>
  )
}
