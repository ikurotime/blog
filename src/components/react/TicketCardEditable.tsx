import { useState } from 'react'
import TicketCard from './TicketCard'

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}

function Field({ label, value, onChange, type = 'text' }: FieldProps) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='font-mono text-[10px] uppercase tracking-wider text-muted'>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='rounded-md border border-line bg-transparent px-2 py-1.5 text-sm text-ink outline-none transition-colors focus:border-ink/40'
      />
    </label>
  )
}

export default function TicketCardEditable() {
  // Client-side only state — edits reset on reload.
  const [name, setName] = useState('David Huertas')
  const [handle, setHandle] = useState('@ikurotime')
  const [event, setEvent] = useState('Launch Week')
  const [ticketNumber, setTicketNumber] = useState(1337)

  return (
    <div className='flex w-full flex-col items-center gap-5'>
      <TicketCard
        name={name}
        handle={handle}
        eventName={event}
        ticketNumber={ticketNumber}
      />

      <div className='grid w-full max-w-[340px] grid-cols-2 gap-2'>
        <Field label='Name' value={name} onChange={setName} />
        <Field label='Handle' value={handle} onChange={setHandle} />
        <Field label='Event' value={event} onChange={setEvent} />
        <Field
          label='Ticket №'
          type='number'
          value={String(ticketNumber)}
          onChange={(v) => setTicketNumber(Number(v) || 0)}
        />
      </div>
    </div>
  )
}
