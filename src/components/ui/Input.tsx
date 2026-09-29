import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const fieldBase =
  'w-full rounded-2xl border border-input bg-white px-4 text-[15px] text-foreground placeholder:text-ink-muted/70 transition-all duration-200 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-60'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-12', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-[110px] resize-none py-3 leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, 'h-12 appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  )
}
