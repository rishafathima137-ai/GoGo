import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

type Props = { children: ReactNode; label?: string }
type State = { error: Error | null }

/**
 * Last line of defence. Without this, a single malformed record throws during
 * render and React unmounts the entire tree — the user sees a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Travora render error', error, info.componentStack)
  }

  private reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-card">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-7" />
          </div>
          <h1 className="mt-4 text-lg font-extrabold tracking-tight text-ink">
            Something went wrong
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
            {this.props.label ? `${this.props.label} hit an unexpected error. ` : ''}
            The rest of the app still works. Try again, or head back to Explore.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-muted p-3 text-left text-[11px] text-ink-muted">
            {error.message}
          </pre>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <RotateCcw className="size-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-semibold text-ink transition-colors hover:bg-muted"
            >
              Back to Explore
            </a>
          </div>
        </div>
      </div>
    )
  }
}
