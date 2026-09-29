import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Copy,
  Languages as LanguagesIcon,
  Mic,
  Search,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import type { Phrase, PhraseCategory } from '../types'
import { phrases, phraseCategories, mockTranslate } from '../data/phrases'
import { getLanguage, languages } from '../data/languages'
import { destinations } from '../data/destinations'
import { translateText, apiConfig } from '../services/api'
import { useProfile } from '../context/ProfileContext'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Textarea, Select } from '../components/ui/Input'
import { Segmented } from '../components/ui/Segmented'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { SectionHeader } from '../components/common/SectionHeader'

export default function TranslatorPage() {
  const [params, setParams] = useSearchParams()
  const { user, setLanguage } = useProfile()
  const initial = params.get('language') ?? 'es'

  const [target, setTarget] = useState(
    languages.some((l) => l.code === initial) ? initial : 'es',
  )
  const [source, setSource] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [phraseQuery, setPhraseQuery] = useState('')
  const [phraseCategory, setPhraseCategory] = useState<PhraseCategory | 'All'>('All')

  const targetLanguage = getLanguage(target)
  const sourceLanguage = languages.find((l) => l.name === user.preferredLanguage) ?? getLanguage('en')

  useEffect(() => {
    setLanguage(targetLanguage.name)
  }, [targetLanguage.name, setLanguage])

  const translate = async (text: string) => {
    if (!text.trim()) {
      setResult('')
      return
    }
    setBusy(true)
    const res = await translateText(text, 'en', target)
    setResult(res.target)
    setBusy(false)
  }

  const filteredPhrases = useMemo(() => {
    const q = phraseQuery.trim().toLowerCase()
    return phrases.filter((p) => {
      if (phraseCategory !== 'All' && p.category !== phraseCategory) return false
      if (!q) return true
      return [p.english, p.translations[target] ?? '', p.pronunciation[target] ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [phraseCategory, phraseQuery, target])

  const speak = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = target
    window.speechSynthesis.speak(u)
  }

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="container py-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Translator & phrasebook
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Quick translations, plus the phrases that actually get you through a trip.
        </p>
      </div>

      {/* Translator */}
      <section className="surface-card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg" aria-hidden>
              {sourceLanguage.flag}
            </span>
            <span className="text-[13.5px] font-bold text-ink">{sourceLanguage.name}</span>
            <ArrowRight className="size-4 text-primary" />
            <span className="text-lg" aria-hidden>
              {targetLanguage.flag}
            </span>
            <span className="text-[13.5px] font-bold text-ink">{targetLanguage.name}</span>
          </div>
          <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
            Translate into
            <Select
              value={target}
              onChange={(e) => {
                setTarget(e.target.value)
                setParams({ language: e.target.value })
                if (source.trim()) void translate(source)
              }}
              className="h-10 w-auto min-w-[130px] text-[13px]"
              aria-label="Target language"
            >
              {languages
                .filter((l) => l.code !== 'en')
                .map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
            </Select>
          </label>
        </div>

        <div className="grid gap-px bg-border/70 sm:grid-cols-2">
          <div className="bg-card p-4">
            <label htmlFor="translator-source" className="text-[12px] font-semibold text-ink-muted">
              English
            </label>
            <Textarea
              id="translator-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Type or paste anything in English…"
              className="mt-1.5 min-h-[132px] border-0 bg-transparent p-0 text-[16px] focus:ring-0"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => speak(source || 'Hello, how are you?')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted transition-colors hover:text-primary"
              >
                <Mic className="size-3.5" />
                Speak example
              </button>
              <div className="flex items-center gap-1">
                {source ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSource('')
                      setResult('')
                    }}
                    aria-label="Clear input"
                    className="grid size-7 place-items-center rounded-full text-ink-muted hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
                <Button size="sm" onClick={() => void translate(source)} disabled={busy || !source.trim()}>
                  {busy ? 'Translating…' : 'Translate'}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-primary-soft/35 p-4">
            <p className="text-[12px] font-semibold text-accent-foreground/80">
              {targetLanguage.name} · {targetLanguage.nativeName}
            </p>
            {busy ? (
              <LoadingState label="Translating…" className="py-8" />
            ) : (
              <>
                <p
                  dir={targetLanguage.code === 'ar' ? 'rtl' : 'ltr'}
                  className="mt-1.5 min-h-[132px] text-[19px] font-semibold leading-snug text-ink"
                >
                  {result || <span className="text-ink-muted/60">Translation appears here</span>}
                </p>
                {result ? (
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => speak(result)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent-foreground transition-opacity hover:opacity-70"
                    >
                      <Volume2 className="size-3.5" />
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={() => void copy(result, 'result')}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted transition-colors hover:text-ink"
                    >
                      {copied === 'result' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied === 'result' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <p className="border-t border-border/70 px-4 py-2.5 text-[11.5px] text-ink-muted">
          {apiConfig.useMockTranslator
            ? 'Prototype mode: translations come from a local phrase engine, not a live provider.'
            : 'Connected to a live translation provider.'}
        </p>
      </section>

      {/* Phrasebook */}
      <section className="mt-8">
        <SectionHeader
          title="Phrasebook"
          subtitle={`${phrases.length} phrases across ${phraseCategories.length} situations`}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={phraseQuery}
              onChange={(e) => setPhraseQuery(e.target.value)}
              placeholder="Search phrases"
              aria-label="Search phrases"
              className="h-11 w-full rounded-full border border-input bg-white pl-10 pr-4 text-[14px] placeholder:text-ink-muted/70 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/12"
            />
          </div>
        </div>

        <div className="mt-3">
          <Segmented
            ariaLabel="Phrase category"
            size="sm"
            value={phraseCategory}
            onChange={setPhraseCategory}
            options={[
              { value: 'All' as const, label: 'All' },
              ...phraseCategories.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>

        <div className="mt-5">
          {filteredPhrases.length === 0 ? (
            <EmptyState
              icon={<LanguagesIcon className="size-6" />}
              title="No phrases match"
              description="Try a different word or category."
              actionLabel="Clear search"
              onAction={() => {
                setPhraseQuery('')
                setPhraseCategory('All')
              }}
            />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {filteredPhrases.map((p) => (
                <PhraseCard
                  key={p.id}
                  phrase={p}
                  code={target}
                  flag={targetLanguage.flag}
                  onSpeak={() => speak(p.translations[target] ?? p.english)}
                  onCopy={() => void copy(p.translations[target] ?? p.english, p.id)}
                  copied={copied === p.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Destination shortcuts */}
      <section className="mt-8">
        <SectionHeader
          title="Jump to a destination"
          subtitle="Opens the phrasebook already set to the local language"
        />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => {
            const supported = languages.some((l) => l.code === d.languageCode)
            return (
              <button
                key={d.id}
                type="button"
                disabled={!supported}
                onClick={() => {
                  setTarget(d.languageCode)
                  setParams({ language: d.languageCode })
                  setPhraseCategory('All')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 text-left transition-all hover:border-primary/40 hover:shadow-card disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold text-ink">{d.name}</span>
                  <span className="block truncate text-[12px] text-ink-muted">{d.language}</span>
                </span>
                <Badge tone="primary">
                  {supported ? <Sparkles className="size-3" /> : null}
                  {supported ? d.language : 'soon'}
                </Badge>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function PhraseCard({
  phrase: p,
  code,
  flag,
  onSpeak,
  onCopy,
  copied,
}: {
  phrase: Phrase
  code: string
  flag: string
  onSpeak: () => void
  onCopy: () => void
  copied: boolean
}) {
  const translation = p.translations[code] ?? mockTranslate(p.english, code)
  const pronunciation = p.pronunciation[code]

  return (
    <article className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-snug text-ink">{p.english}</p>
          <p
            dir={code === 'ar' ? 'rtl' : 'ltr'}
            className="mt-1.5 text-[15px] font-semibold text-accent-foreground"
          >
            {flag} {translation}
          </p>
          {pronunciation ? (
            <p className="mt-1 text-[12px] italic text-ink-muted">{pronunciation}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            onClick={onSpeak}
            aria-label={`Play ${p.english}`}
            className="grid size-9 place-items-center rounded-full bg-primary-soft text-accent-foreground transition-colors hover:bg-primary hover:text-white"
          >
            <Volume2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy translation of ${p.english}`}
            className={cn(
              'grid size-9 place-items-center rounded-full transition-colors',
              copied ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-ink-muted hover:text-ink',
            )}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {p.category}
      </p>
    </article>
  )
}
