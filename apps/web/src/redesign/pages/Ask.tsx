import { type FormEvent, useState } from 'react'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'

type AskMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export const Ask = () => {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<AskMessage[]>([])

  const handleAsk = (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: value },
      {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        text: 'Milestone A ships the Ask shell only. Full Q&A arrives in a later milestone.',
      },
    ])
    setQuery('')
  }

  return (
    <AlmanacLayout>
      <main style={{ padding: '32px 36px 56px', display: 'grid', gap: 22 }}>
        <HeroCard
          eyebrow="Ask Patch"
          title={<>Garden <em style={{ color: 'var(--terracotta)' }}>questions</em>, soon.</>}
          subtitle="This is the Milestone A shell for conversational help."
          titleSize={50}
        />

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="Prompt" />
          <form onSubmit={handleAsk} style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <textarea
              rows={4}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Why is my basil yellowing?"
              style={{ border: '1px solid var(--rule)', background: 'var(--paper)', color: 'var(--ink)', padding: '10px 12px', font: 'inherit' }}
            />
            <div>
              <button type="submit" className="btn-primary">Ask</button>
            </div>
          </form>
        </section>

        <section style={{ border: '1px solid var(--rule)', background: 'var(--cream)', padding: 16 }}>
          <SectionHeader title="History" trailing={`${messages.length} MESSAGES`} />
          {messages.length === 0 ? (
            <p style={{ marginTop: 12, color: 'var(--ink-soft)' }}>No prompts yet.</p>
          ) : (
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {messages.map((message) => (
                <article key={message.id} style={{ border: '1px solid var(--rule-soft)', padding: 10, background: message.role === 'user' ? 'var(--paper)' : 'var(--paper-2)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
                    {message.role === 'user' ? 'YOU' : 'PATCH'}
                  </div>
                  <p style={{ margin: '6px 0 0', color: 'var(--ink)', fontFamily: 'var(--font-slab)' }}>{message.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AlmanacLayout>
  )
}
