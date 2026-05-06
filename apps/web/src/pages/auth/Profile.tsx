import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, User } from 'lucide-react'
import PaperBackdrop from '@/redesign/components/PaperBackdrop'
import PaperCard from '@/redesign/components/PaperCard'
import { useAuthStore } from '@/stores/authStore'

export function Profile() {
  const { user, logout, isLoading } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <PaperBackdrop variant="cream" style={{ padding: '32px 16px' }}>
      <main style={{ width: 'min(100%, 920px)', margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <span className="stamp" style={{ color: 'var(--terracotta)' }}>Account</span>
            <h1 className="font-display" style={{ fontSize: 56, lineHeight: 1, margin: '14px 0 0' }}>
              Profile
            </h1>
          </div>
          <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
            Back to garden
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
          <PaperCard className="book-frame" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="chip">
                <User size={14} />
                Gardener
              </span>
              <span className="dotted-rule" style={{ flex: 1 }} />
            </div>

            <dl style={{ display: 'grid', gap: 22, margin: 0 }}>
              <div>
                <dt style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-slab)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Name
                </dt>
                <dd style={{ margin: '6px 0 0', fontSize: 24 }}>{user.name}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-slab)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Email
                </dt>
                <dd style={{ margin: '6px 0 0', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} />
                  {user.email}
                </dd>
              </div>
              <div>
                <dt style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-slab)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Member Since
                </dt>
                <dd style={{ margin: '6px 0 0', fontSize: 18 }}>
                  {user.createdAt.toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </PaperCard>

          <PaperCard style={{ padding: 24, alignSelf: 'start' }}>
            <h2 className="font-slab" style={{ fontSize: 18, margin: 0 }}>Session</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '8px 0 20px' }}>
              Sign out of this browser.
            </p>
            <button type="button" className="btn-primary" onClick={handleLogout} disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
              <LogOut size={16} />
              {isLoading ? 'Signing out' : 'Sign out'}
            </button>
          </PaperCard>
        </section>
      </main>
    </PaperBackdrop>
  )
}
