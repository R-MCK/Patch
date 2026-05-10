import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CareTask, GardenZone } from '@patch/core'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'
import { api } from '@/lib/api'
import { usePlantStore } from '@/stores/plantStore'

type CaptureTab = 'photo' | 'note' | 'voice' | 'task'

const TABS: CaptureTab[] = ['photo', 'note', 'voice', 'task']

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid var(--rule)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  padding: '10px 12px',
  font: 'inherit',
}

export const Capture = () => {
  const navigate = useNavigate()
  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)

  const [tab, setTab] = useState<CaptureTab>('photo')
  const [selectedPlantId, setSelectedPlantId] = useState('')
  const [tasks, setTasks] = useState<CareTask[]>([])
  const [noteContent, setNoteContent] = useState('')
  const [photoData, setPhotoData] = useState('')
  const [photoCaption, setPhotoCaption] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [zones, setZones] = useState<GardenZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [newPlantName, setNewPlantName] = useState('')
  const [newPlantSpecies, setNewPlantSpecies] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (plants.length === 0) {
      void fetchPlants()
    }
  }, [plants.length, fetchPlants])

  const activePlantId = selectedPlantId || plants[0]?.id || ''
  const activePlant = plants.find((plant) => plant.id === activePlantId)
  const zoneForSubmission = activePlant?.gardenId ? selectedZoneId : ''

  useEffect(() => {
    if (tab !== 'task' || !activePlantId) {
      return
    }

    let cancelled = false
    void (async () => {
      const plantTasks = await api.getTasks(activePlantId).catch(() => [] as CareTask[])
      if (cancelled) return
      const openTasks = plantTasks.filter((task) => !task.completedDate)
      setTasks(openTasks)
      setSelectedTaskId(openTasks[0]?.id ?? '')
    })()

    return () => {
      cancelled = true
    }
  }, [tab, activePlantId])

  useEffect(() => {
    const gardenId = activePlant?.gardenId
    if (!gardenId) {
      return
    }

    let cancelled = false
    void (async () => {
      const rows = await api.getGardenZones(gardenId).catch(() => [] as GardenZone[])
      if (cancelled) return
      setZones(rows)
      setSelectedZoneId((prev) => {
        if (prev && rows.some((zone) => zone.id === prev)) return prev
        return rows[0]?.id ?? ''
      })
    })()

    return () => {
      cancelled = true
    }
  }, [activePlant?.gardenId])

  const canSubmit = useMemo(() => {
    if (!activePlantId) return false
    if (tab === 'note') return noteContent.trim().length > 0
    if (tab === 'photo') return photoData.trim().length > 0
    if (tab === 'voice') return false
    return selectedTaskId.length > 0
  }, [noteContent, photoData, activePlantId, selectedTaskId, tab])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!activePlantId) {
      setError('Pick a plant first.')
      return
    }
    if (!canSubmit) {
      setError('Complete the selected capture input first.')
      return
    }

    setIsSaving(true)
    try {
      if (tab === 'note') {
        await api.createPlantObservation(activePlantId, {
          observation_type: 'textNote',
          text_content: noteContent.trim(),
          zone_id: zoneForSubmission || null,
        })
      } else if (tab === 'photo') {
        await api.createPlantObservation(activePlantId, {
          observation_type: 'photo',
          image_data: photoData.trim(),
          text_content: photoCaption.trim() || null,
          zone_id: zoneForSubmission || null,
        })
      } else if (tab === 'task') {
        await api.completeTask(selectedTaskId)
        await api.createPlantObservation(activePlantId, {
          observation_type: 'taskComplete',
          text_content: 'Task marked complete',
          zone_id: zoneForSubmission || null,
        })
      }
      navigate('/today')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Capture failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AlmanacLayout>
      <main style={{ padding: '32px 36px 56px', maxWidth: 880 }}>
        <HeroCard
          eyebrow="Quick Capture"
          title={<><em style={{ color: 'var(--terracotta)' }}>Capture</em> in the moment.</>}
          subtitle="Log a note, photo, voice memo stub, or task completion."
          titleSize={50}
        />

        <form onSubmit={handleSubmit} style={{ marginTop: 22, border: '1px solid var(--rule)', background: 'var(--cream)', padding: 18, display: 'grid', gap: 18 }}>
          {plants.length === 0 && (
            <section style={{ border: '1px solid var(--rule)', background: 'var(--paper)', padding: 12, display: 'grid', gap: 10 }}>
              <SectionHeader title="Create your first plant" titleSize={20} marginBottom={6} ruleMarginBottom={0} />
              <input
                value={newPlantName}
                onChange={(event) => setNewPlantName(event.target.value)}
                placeholder="Plant name"
                style={inputStyle}
              />
              <input
                value={newPlantSpecies}
                onChange={(event) => setNewPlantSpecies(event.target.value)}
                placeholder="Species (optional)"
                style={inputStyle}
              />
              <button
                type="button"
                className="btn-primary"
                disabled={isSaving || newPlantName.trim().length === 0}
                onClick={() => {
                  void (async () => {
                    setIsSaving(true)
                    setError('')
                    try {
                      await api.createPlant({
                        name: newPlantName.trim(),
                        species: newPlantSpecies.trim() || undefined,
                      })
                      await fetchPlants()
                      setNewPlantName('')
                      setNewPlantSpecies('')
                    } catch (createError) {
                      setError(createError instanceof Error ? createError.message : 'Failed to create plant')
                    } finally {
                      setIsSaving(false)
                    }
                  })()
                }}
              >
                {isSaving ? 'Creating plant…' : 'Create plant'}
              </button>
            </section>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                className={item === tab ? 'btn-primary' : 'btn-ghost'}
                style={item === tab ? undefined : { padding: '8px 10px' }}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>PLANT</span>
            <select value={activePlantId} onChange={(event) => setSelectedPlantId(event.target.value)} style={inputStyle}>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>{plant.name}</option>
              ))}
            </select>
          </label>

          {activePlant?.gardenId && zones.length > 0 && (
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>ZONE</span>
              <select value={selectedZoneId} onChange={(event) => setSelectedZoneId(event.target.value)} style={inputStyle}>
                <option value="">No zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </label>
          )}

          {tab === 'note' && (
            <label style={{ display: 'grid', gap: 6 }}>
              <SectionHeader title="Note" titleSize={20} marginBottom={6} ruleMarginBottom={0} />
              <textarea
                rows={5}
                value={noteContent}
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="What changed in the garden?"
                style={inputStyle}
              />
            </label>
          )}

          {tab === 'photo' && (
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <SectionHeader title="Photo" titleSize={20} marginBottom={6} ruleMarginBottom={0} />
                <textarea
                  rows={4}
                  value={photoData}
                  onChange={(event) => setPhotoData(event.target.value)}
                  placeholder="Paste a data URL / image marker for now (Phase 5 shell)."
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>CAPTION</span>
                <input
                  value={photoCaption}
                  onChange={(event) => setPhotoCaption(event.target.value)}
                  placeholder="Optional caption"
                  style={inputStyle}
                />
              </label>
            </div>
          )}

          {tab === 'voice' && (
            <div style={{ border: '1px dashed var(--rule)', padding: 14, color: 'var(--ink-soft)' }}>
              Voice capture ships later. This tab is the Milestone A shell.
            </div>
          )}

          {tab === 'task' && (
            <label style={{ display: 'grid', gap: 6 }}>
              <SectionHeader title="Task Complete" titleSize={20} marginBottom={6} ruleMarginBottom={0} />
              <select value={selectedTaskId} onChange={(event) => setSelectedTaskId(event.target.value)} style={inputStyle}>
                {tasks.length === 0 ? (
                  <option value="">No open tasks for this plant</option>
                ) : (
                  tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.taskType} · {task.scheduledDate.toLocaleDateString()}
                    </option>
                  ))
                )}
              </select>
            </label>
          )}

          {error && (
            <div role="alert" style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 10 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary" disabled={isSaving || !canSubmit}>
              {isSaving ? 'Saving…' : 'Save capture'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/today')}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    </AlmanacLayout>
  )
}
