import { type CSSProperties, type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import { useProfileStore } from '@/stores/profileStore'

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid var(--rule)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  padding: '10px 12px',
  font: 'inherit',
}

export const Onboarding = () => {
  const navigate = useNavigate()
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const skipOnboarding = useProfileStore((s) => s.skipOnboarding)
  const isSaving = useProfileStore((s) => s.isLoading)

  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [postcode, setPostcode] = useState('')
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [goals, setGoals] = useState('')
  const [climateNotes, setClimateNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await updateProfile({
        country: country.trim() || null,
        region: region.trim() || null,
        postcode: postcode.trim() || null,
        units,
        experience_level: experienceLevel.trim() || null,
        goals: goals.trim() || null,
        climate_notes: climateNotes.trim() || null,
      })
      navigate('/today')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save profile')
    }
  }

  const handleSkip = () => {
    skipOnboarding()
    navigate('/today')
  }

  return (
    <AlmanacLayout>
      <main style={{ padding: '32px 36px 56px', maxWidth: 860 }}>
        <HeroCard
          eyebrow="First launch"
          title={<>Set your <em style={{ color: 'var(--terracotta)' }}>growing context</em>.</>}
          subtitle="These details tune seasonal nudges and weather context."
          titleSize={50}
        />

        <form onSubmit={handleSubmit} style={{ marginTop: 22, border: '1px solid var(--rule)', background: 'var(--cream)', padding: 18, display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            Country
            <input value={country} onChange={(event) => setCountry(event.target.value)} style={inputStyle} placeholder="United States" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Region / State
            <input value={region} onChange={(event) => setRegion(event.target.value)} style={inputStyle} placeholder="California" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Postcode
            <input value={postcode} onChange={(event) => setPostcode(event.target.value)} style={inputStyle} placeholder="94110" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Units
            <select value={units} onChange={(event) => setUnits(event.target.value as 'imperial' | 'metric')} style={inputStyle}>
              <option value="imperial">Imperial (°F, inches)</option>
              <option value="metric">Metric (°C, cm)</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Experience level
            <input value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} style={inputStyle} placeholder="Beginner / Intermediate / Advanced" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Goals
            <textarea value={goals} onChange={(event) => setGoals(event.target.value)} style={inputStyle} rows={3} placeholder="What do you want to grow this season?" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            Climate notes
            <textarea value={climateNotes} onChange={(event) => setClimateNotes(event.target.value)} style={inputStyle} rows={3} placeholder="Any local weather patterns to remember?" />
          </label>

          {error && (
            <div role="alert" style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 10 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save profile'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </form>
      </main>
    </AlmanacLayout>
  )
}
