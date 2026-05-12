import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, User } from 'lucide-react'
import PaperBackdrop from '@/redesign/components/PaperBackdrop'
import PaperCard from '@/redesign/components/PaperCard'
import { useAuthStore } from '@/stores/authStore'
import { type CSSProperties, type FormEvent, useEffect, useState } from 'react'
import { useProfileStore } from '@/stores/profileStore'

export function Profile() {
  const { user, logout, isLoading } = useAuthStore()
  const profile = useProfileStore((s) => s.profile)
  const profileLoaded = useProfileStore((s) => s.hasLoaded)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const saveProfile = useProfileStore((s) => s.updateProfile)
  const isSavingProfile = useProfileStore((s) => s.isLoading)
  const navigate = useNavigate()
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!profileLoaded) {
      void fetchProfile()
    }
  }, [profileLoaded, fetchProfile])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault()
    setSaveError('')
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const units = formData.get('units') === 'metric' ? 'metric' : 'imperial'

    try {
      await saveProfile({
        country: String(formData.get('country') ?? '').trim() || null,
        region: String(formData.get('region') ?? '').trim() || null,
        postcode: String(formData.get('postcode') ?? '').trim() || null,
        units,
        experience_level: String(formData.get('experience_level') ?? '').trim() || null,
        goals: String(formData.get('goals') ?? '').trim() || null,
        climate_notes: String(formData.get('climate_notes') ?? '').trim() || null,
      })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  if (!user) return null

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

          <PaperCard style={{ padding: 24, alignSelf: 'start', display: 'grid', gap: 18 }}>
            <form onSubmit={handleProfileSave} style={{ display: 'grid', gap: 10 }} key={profile?.updatedAt.toISOString() ?? 'empty-profile'}>
              <h2 className="font-slab" style={{ fontSize: 18, margin: 0 }}>Growing profile</h2>
              <input name="country" defaultValue={profile?.country ?? ''} placeholder="Country" style={fieldStyle} />
              <input name="region" defaultValue={profile?.region ?? ''} placeholder="Region / state" style={fieldStyle} />
              <input name="postcode" defaultValue={profile?.postcode ?? ''} placeholder="Postcode" style={fieldStyle} />
              <select name="units" defaultValue={profile?.units ?? 'imperial'} style={fieldStyle}>
                <option value="imperial">Imperial</option>
                <option value="metric">Metric</option>
              </select>
              <input name="experience_level" defaultValue={profile?.experienceLevel ?? ''} placeholder="Experience level" style={fieldStyle} />
              <textarea name="goals" defaultValue={profile?.goals ?? ''} placeholder="Goals" rows={2} style={fieldStyle} />
              <textarea name="climate_notes" defaultValue={profile?.climateNotes ?? ''} placeholder="Climate notes" rows={2} style={fieldStyle} />
              {saveError && (
                <div role="alert" style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 8 }}>
                  {saveError}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving profile' : 'Save profile'}
              </button>
            </form>

            <div>
              <h2 className="font-slab" style={{ fontSize: 18, margin: 0 }}>Session</h2>
              <p style={{ color: 'var(--ink-soft)', margin: '8px 0 20px' }}>
                Sign out of this browser.
              </p>
              <button type="button" className="btn-primary" onClick={handleLogout} disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
                <LogOut size={16} />
                {isLoading ? 'Signing out' : 'Sign out'}
              </button>
            </div>
          </PaperCard>
        </section>
      </main>
    </PaperBackdrop>
  )
}

const fieldStyle: CSSProperties = {
  width: '100%',
  border: '1px solid var(--rule)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  padding: '10px 12px',
  font: 'inherit',
}
