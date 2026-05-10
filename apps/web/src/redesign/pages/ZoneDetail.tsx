import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Observation, PlantingRecord } from '@/types'
import { api } from '@/lib/api'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'

export const ZoneDetail = () => {
  const { gardenId = '', zoneId = '' } = useParams<{ gardenId: string; zoneId: string }>()
  const [history, setHistory] = useState<PlantingRecord[]>([])
  const [observations, setObservations] = useState<Observation[]>([])

  useEffect(() => {
    if (!zoneId) return
    let cancelled = false
    void (async () => {
      const [historyRows, observationRows] = await Promise.all([
        api.getZoneHistory(zoneId).catch(() => [] as PlantingRecord[]),
        api.getZoneObservations(zoneId).catch(() => [] as Observation[]),
      ])
      if (cancelled) return
      setHistory(historyRows)
      setObservations(observationRows)
    })()
    return () => {
      cancelled = true
    }
  }, [zoneId])

  const priorYear = new Date().getFullYear() - 1
  const grewLastYear = useMemo(
    () => history.filter((record) => record.year === priorYear).map((record) => record.plantNameSnapshot),
    [history, priorYear],
  )

  return (
    <AlmanacLayout>
      <main style={{ padding: '32px 36px 56px', display: 'grid', gap: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Link to="/design" className="btn-ghost" style={{ textDecoration: 'none' }}>Back to designer</Link>
          <Link to={`/design/${gardenId}`} className="btn-ghost" style={{ textDecoration: 'none' }}>Back to garden</Link>
        </div>

        <HeroCard
          eyebrow="Zone Detail"
          title={<>Zone <em style={{ color: 'var(--terracotta)' }}>{zoneId}</em></>}
          subtitle="Planting history, observations, and rotation context."
          titleSize={50}
        />

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="Planting History" trailing={`${history.length} RECORDS`} />
          {history.length === 0 ? (
            <p style={{ marginTop: 12, color: 'var(--ink-soft)' }}>No planting records yet for this zone.</p>
          ) : (
            <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {history.map((record) => (
                <li key={record.id} style={{ border: '1px solid var(--rule)', background: 'var(--paper)', padding: '8px 10px' }}>
                  <div style={{ fontFamily: 'var(--font-slab)', fontWeight: 600 }}>{record.plantNameSnapshot}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    Planted {record.plantedAt.toLocaleDateString()} · {record.season ?? 'Season TBD'} {record.year ?? ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="Observations" trailing={`${observations.length} ENTRIES`} />
          {observations.length === 0 ? (
            <p style={{ marginTop: 12, color: 'var(--ink-soft)' }}>No observations recorded for this zone yet.</p>
          ) : (
            <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {observations.map((observation) => (
                <li key={observation.id} style={{ border: '1px solid var(--rule)', background: 'var(--paper)', padding: '8px 10px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    {observation.observationType.toUpperCase()} · {observation.observedAt.toLocaleDateString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-slab)', marginTop: 4 }}>
                    {observation.textContent || (observation.observationType === 'photo' ? 'Photo capture' : 'Observation')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="What Grew Here Last Year?" />
          {grewLastYear.length === 0 ? (
            <p style={{ marginTop: 12, color: 'var(--ink-soft)' }}>No records for {priorYear}.</p>
          ) : (
            <p style={{ marginTop: 12, color: 'var(--ink)' }}>{grewLastYear.join(', ')}</p>
          )}
        </section>
      </main>
    </AlmanacLayout>
  )
}
