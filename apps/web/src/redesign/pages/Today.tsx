import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isDueToday, isOverdue, type CareTask, type Observation } from '@patch/core'
import AlmanacLayout from '../components/AlmanacLayout'
import CapturePill from '../components/CapturePill'
import EmptyState from '../components/EmptyState'
import HeroCard from '../components/HeroCard'
import OverdueBadge from '../components/OverdueBadge'
import SectionHeader from '../components/SectionHeader'
import UrgencyBadge from '../components/UrgencyBadge'
import WeatherChip from '../components/WeatherChip'
import { DropGlyph, PlusGlyph, SproutGlyph, SunGlyph } from '../glyphs'
import { getCurrentSeason } from '../services/SeasonService'
import { api } from '@/lib/api'
import { useGardenStore } from '@/stores/gardenStore'
import { usePlantStore } from '@/stores/plantStore'
import { useProfileStore } from '@/stores/profileStore'

type ActivityItem = {
  id: string
  kind: 'note' | 'photo'
  plantName: string
  text: string
  date: Date
}

type TaskItem = {
  task: CareTask
  plantName: string
  daysOverdue?: number
}

export const Today = () => {
  const navigate = useNavigate()
  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  const profile = useProfileStore((s) => s.profile)
  const profileLoaded = useProfileStore((s) => s.hasLoaded)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)

  const [tasksByPlant, setTasksByPlant] = useState<Record<string, CareTask[]>>({})
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)

  useEffect(() => {
    void fetchPlants()
    void fetchGardens()
  }, [fetchPlants, fetchGardens])

  useEffect(() => {
    if (!profileLoaded) {
      void fetchProfile()
    }
  }, [profileLoaded, fetchProfile])

  useEffect(() => {
    let cancelled = false
    if (plants.length === 0) {
      return
    }

    void (async () => {
      setLoadingTasks(true)
      try {
        const entries = await Promise.all(
          plants.map(async (plant) => {
            const tasks = await api.getTasks(plant.id).catch(() => [] as CareTask[])
            return [plant.id, tasks] as const
          }),
        )
        if (cancelled) return
        setTasksByPlant(Object.fromEntries(entries))
      } finally {
        if (!cancelled) setLoadingTasks(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [plants])

  useEffect(() => {
    let cancelled = false
    if (plants.length === 0) {
      return
    }

    void (async () => {
      setLoadingActivity(true)
      try {
        const activityRows = await Promise.all(
          plants.map(async (plant) => {
            const observations = await api.getPlantObservations(plant.id).catch(() => [] as Observation[])
            return buildPlantActivity(plant.name, observations)
          }),
        )
        if (cancelled) return
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const merged = activityRows
          .flat()
          .filter((item) => item.date.getTime() >= sevenDaysAgo)
          .sort((a, b) => b.date.getTime() - a.date.getTime())
        setRecentActivity(merged)
      } finally {
        if (!cancelled) setLoadingActivity(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [plants])

  const { overdueTasks, dueTodayTasks } = useMemo(() => {
    const now = new Date()
    const allTasks: TaskItem[] = []
    for (const plant of plants) {
      const tasks = tasksByPlant[plant.id] ?? []
      for (const task of tasks) {
        allTasks.push({ task, plantName: plant.name })
      }
    }

    const openTasks = allTasks.filter(({ task }) => !task.completedDate)
    const overdueTasks = openTasks
      .filter(({ task }) => isOverdue(task, now))
      .map((row) => ({
        ...row,
        daysOverdue: Math.max(1, Math.floor((now.getTime() - row.task.scheduledDate.getTime()) / 86_400_000)),
      }))

    return {
      overdueTasks,
      dueTodayTasks: openTasks.filter(({ task }) => isDueToday(task, now)),
    }
  }, [plants, tasksByPlant])

  const seasonSummary = getCurrentSeason(profile)
  const locationLabel = [profile?.region, profile?.country].filter(Boolean).join(', ') || 'Profile location needed'
  const weatherText = profile ? `Forecast for ${locationLabel}` : 'Set profile location for weather'

  const handleCompleteTask = async (taskId: string, plantId: string) => {
    await api.completeTask(taskId)
    const refreshed = await api.getTasks(plantId).catch(() => [])
    setTasksByPlant((prev) => ({
      ...prev,
      [plantId]: refreshed,
    }))
  }

  return (
    <AlmanacLayout>
      <main style={{ padding: '30px 36px 64px', display: 'grid', gap: 28 }}>
        <HeroCard
          eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          title={<>Today in your <em style={{ color: 'var(--terracotta)' }}>patch</em></>}
          subtitle={`Tracking ${plants.length} plants across ${gardens.length} gardens.`}
          titleSize={54}
          trailing={
            <WeatherChip
              icon={<SunGlyph size={14} />}
              temp={profile ? '72°' : '—'}
              condition={weatherText}
            />
          }
        />

        {plants.length === 0 ? (
          <EmptyState
            illustration={<SproutGlyph size={72} color="var(--moss)" />}
            title="Add your first plant"
            body="Today never stays blank. Start with one plant and Patch will build your daily rhythm from there."
            cta={{ label: 'Open plants', onClick: () => navigate('/plants') }}
          />
        ) : (
          <>
            <section>
              <SectionHeader
                title="Overdue Tasks"
                subtitle="Anything red needs attention first."
                trailing={`${overdueTasks.length} ITEMS`}
              />
              {loadingTasks ? (
                <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>Loading task ledger…</p>
              ) : overdueTasks.length === 0 ? (
                <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>No overdue tasks right now.</p>
              ) : (
                <TaskList rows={overdueTasks} onCompleteTask={handleCompleteTask} />
              )}
            </section>

            <section>
              <SectionHeader
                title="Due Today"
                subtitle="Tap complete as you move through the garden."
                trailing={`${dueTodayTasks.length} ITEMS`}
              />
              {loadingTasks ? (
                <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>Loading task ledger…</p>
              ) : dueTodayTasks.length === 0 ? (
                <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>No tasks due today.</p>
              ) : (
                <TaskList rows={dueTodayTasks} onCompleteTask={handleCompleteTask} />
              )}
            </section>
          </>
        )}

        <section>
          <SectionHeader
            title="Recent Activity"
            subtitle="Last 7 days of notes and captures."
            trailing={loadingActivity ? 'LOADING' : `${recentActivity.length} ENTRIES`}
          />
          {recentActivity.length === 0 ? (
            <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>No recent notes or photos yet. Use Capture to log one.</p>
          ) : (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {recentActivity.map((item) => (
                <article key={item.id} style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="chip" style={{ margin: 0 }}>{item.kind === 'note' ? 'Note' : 'Photo'}</span>
                    <time style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                      {item.date.toLocaleDateString()}
                    </time>
                  </div>
                  <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-slab)', color: 'var(--ink)' }}>{item.text}</p>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    {item.plantName.toUpperCase()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader
            title={`${seasonSummary.season} Nudges`}
            subtitle={`${seasonSummary.hemisphere === 'northern' ? 'Northern' : 'Southern'} hemisphere · ${seasonSummary.plantingWindow}`}
            trailing={<Link to="/profile" className="link-ink" style={{ fontSize: 11 }}>PROFILE</Link>}
          />
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'grid', gap: 8 }}>
            {seasonSummary.nudges.map((nudge) => (
              <li key={nudge} style={{ fontFamily: 'var(--font-slab)', color: 'var(--ink-soft)' }}>{nudge}</li>
            ))}
          </ul>
        </section>
      </main>

      <CapturePill icon={<PlusGlyph size={14} />} onClick={() => navigate('/capture')} />
    </AlmanacLayout>
  )
}

function buildPlantActivity(plantName: string, observations: Observation[]): ActivityItem[] {
  return observations
    .filter((observation) => observation.observationType === 'textNote' || observation.observationType === 'photo')
    .map((observation) => ({
      id: `${observation.observationType}:${observation.id}`,
      kind: observation.observationType === 'photo' ? 'photo' : 'note',
      plantName,
      text: observation.textContent || (observation.observationType === 'photo' ? 'Photo capture' : 'Field note'),
      date: observation.observedAt,
    }))
}

function TaskList({ rows, onCompleteTask }: {
  rows: TaskItem[]
  onCompleteTask: (taskId: string, plantId: string) => Promise<void>
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 10 }}>
      {rows.map((row) => {
        const { task, plantName } = row
        return (
        <li key={task.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center', border: '1px solid var(--rule)', background: 'var(--cream)', padding: '10px 12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-slab)', fontWeight: 600 }}>{task.taskType} · {plantName}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 4 }}>
              Scheduled {task.scheduledDate.toLocaleDateString()}
            </div>
          </div>
          {row.daysOverdue ? <OverdueBadge count={row.daysOverdue} /> : <UrgencyBadge level="due-today" />}
          <button type="button" className="btn-primary" style={{ padding: '8px 12px', fontSize: 11 }} onClick={() => { void onCompleteTask(task.id, task.plantId) }}>
            <DropGlyph size={12} />
            Complete
          </button>
        </li>
        )
      })}
    </ul>
  )
}
