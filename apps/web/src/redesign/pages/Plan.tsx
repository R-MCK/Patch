import { Link } from 'react-router-dom'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'

export const Plan = () => {
  return (
    <AlmanacLayout>
      <main style={{ padding: '32px 36px 56px', display: 'grid', gap: 22 }}>
        <HeroCard
          eyebrow="Plan"
          title={<>Shape the next <em style={{ color: 'var(--terracotta)' }}>garden move</em>.</>}
          subtitle="Quick links to the core planning workspaces."
          titleSize={50}
        />

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="Design" subtitle="Map beds and placements." />
          <div style={{ marginTop: 12 }}>
            <Link to="/design" className="btn-primary" style={{ textDecoration: 'none' }}>
              Open Garden Designer
            </Link>
          </div>
        </section>

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="Timeline" subtitle="Review upcoming and past seasonal milestones." />
          <div style={{ marginTop: 12 }}>
            <Link to="/dashboard/almanac" className="btn-primary" style={{ textDecoration: 'none' }}>
              Open Almanac
            </Link>
          </div>
        </section>
      </main>
    </AlmanacLayout>
  )
}
