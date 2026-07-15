import ScrambleTextDemo from '../components/experiments/ScrambleTextDemo.astro'
import DynamicButtonDemo from '../components/experiments/DynamicButtonDemo.astro'
import TicketCardDemo from '../components/experiments/TicketCardDemo.astro'
import LanyardBadgeDemo from '../components/experiments/LanyardBadgeDemo.astro'
import ContributionGridDemo from '../components/experiments/ContributionGridDemo.astro'
import DateSelectorDemo from '../components/experiments/DateSelectorDemo.astro'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CodeFile } from '../components/CodeTabs.astro'

// Read the real component source at build time so the code viewer never drifts.
const readSource = (file: string) =>
  readFileSync(join(process.cwd(), 'src/components/react', file), 'utf-8')

const scrambleTextSource = readSource('ScrambleText.tsx')
const dynamicButtonSource = readSource('DynamicButton.tsx')
const ticketCardSource = readSource('TicketCard.tsx')
const ticketCardEditableSource = readSource('TicketCardEditable.tsx')
const lanyardBadgeSource = readSource('LanyardBadge.tsx')
const contributionGridSource = readSource('ContributionGrid.tsx')
const dateSelectorSource = readSource('DateSelector.tsx')

export interface Experiment {
  slug: string
  title: string
  /** Short, one-line description used on cards. */
  description: string
  /** Longer explanation shown on the detail page. */
  about: string
  tags: string[]
  /** The showcase component rendered in the demo area. */
  Demo: any
  /** Source files shown in the code viewer on the detail page. */
  files: CodeFile[]
}

const scrambleTextUsage = `---
import ScrambleText from '../components/react/ScrambleText.tsx'
---

<!-- client:visible hydrates the island when it scrolls into view -->
<ScrambleText client:visible text="hello, world" />

<!-- Cycles through phrases on hover -->
<ScrambleText
  client:visible
  phrases={['hello, world', 'ship it →', 'vim > all']}
/>
`

const dynamicButtonUsage = `---
import DynamicButton from '../components/react/DynamicButton.tsx'
---

<DynamicButton client:visible />
`

const ticketCardUsage = `---
// Editable island: inputs drive the ticket, client-side only.
import TicketCardEditable from '../components/react/TicketCardEditable.tsx'
---

<TicketCardEditable client:visible />

<!-- Or use the presentational card directly with fixed props -->
<TicketCard client:visible name="David Huertas" ticketNumber={1337} />
`

const lanyardBadgeUsage = `---
import LanyardBadge from '../components/react/LanyardBadge.tsx'
---

<!-- Grab the badge and give it a swing -->
<LanyardBadge
  client:visible
  name="David Huertas"
  role="Software Engineer"
  event="Launch Week"
/>
`

const contributionGridUsage = `---
import ContributionGrid from '../components/react/ContributionGrid.tsx'
---

<ContributionGrid client:visible />
`

const dateSelectorUsage = `---
import DateSelector from '../components/react/DateSelector.tsx'
---

<!-- logDays sets how many days back are selectable -->
<DateSelector client:visible logDays={38} />
`

export const experiments: Experiment[] = [
  {
    slug: 'event-ticket',
    title: 'Event Ticket',
    description: 'A holographic event ticket that tilts and shines with your pointer.',
    about:
      'A premium event ticket in the spirit of Supabase Launch Week passes. It tracks the pointer to tilt in 3D, sweeping a holographic foil and a specular glare across a dark card with a gradient border. All the shine is layered CSS driven by pointer position, and the tilt is disabled for visitors who prefer reduced motion. The inputs below let you customise the ticket live — state is client-side only, so it resets on reload.',
    tags: ['React', '3D', 'Editable'],
    Demo: TicketCardDemo,
    files: [
      { name: 'TicketCardEditable.tsx', lang: 'tsx', code: ticketCardEditableSource },
      { name: 'TicketCard.tsx', lang: 'tsx', code: ticketCardSource },
      { name: 'Usage.astro', lang: 'astro', code: ticketCardUsage }
    ]
  },
  {
    slug: 'lanyard-badge',
    title: 'Lanyard Badge',
    description: 'A conference badge on a cord. Grab it and give it a swing.',
    about:
      'An in-person event badge hanging from a lanyard, with real rope physics. The cord is a chain of points solved with Verlet integration and distance constraints under gravity; the badge is attached at the bottom and rotates to follow the rope. Grab it with the pointer to drag and swing it — on release it settles naturally. No physics library, just a small integration loop, and motion is skipped for visitors who prefer reduced motion.',
    tags: ['React', 'Physics', 'Canvas-free'],
    Demo: LanyardBadgeDemo,
    files: [
      { name: 'LanyardBadge.tsx', lang: 'tsx', code: lanyardBadgeSource },
      { name: 'Usage.astro', lang: 'astro', code: lanyardBadgeUsage }
    ]
  },
  {
    slug: 'contribution-grid',
    title: 'Contribution Grid',
    description: 'A GitHub-style activity heatmap with hover tooltips.',
    about:
      'A GitHub-style contribution heatmap: 53 weeks of days shaded by activity level, with month and weekday labels, a hover tooltip showing the count and date, and a Less → More legend. Colors adapt to light and dark mode. The data is generated on the client to keep dates and levels consistent between server render and hydration.',
    tags: ['React', 'Data viz'],
    Demo: ContributionGridDemo,
    files: [
      { name: 'ContributionGrid.tsx', lang: 'tsx', code: contributionGridSource },
      { name: 'Usage.astro', lang: 'astro', code: contributionGridUsage }
    ]
  },
  {
    slug: 'date-selector',
    title: 'Date Selector',
    description: 'A day scrubber with a bell-curve timeline that recenters on your pick.',
    about:
      'A date navigator built as a bell-curve timeline. Each day is a bar whose height follows a Gaussian curve peaking at the selected day; picking a day (or stepping with the arrows) re-centers the strip and reshapes the curve with a smooth spring-like transition. Selectable days are solid, the current selection is highlighted, out-of-range days are dimmed, and future days render as dotted placeholders. A horizontal mask fades the strip at both edges.',
    tags: ['React', 'Interaction'],
    Demo: DateSelectorDemo,
    files: [
      { name: 'DateSelector.tsx', lang: 'tsx', code: dateSelectorSource },
      { name: 'Usage.astro', lang: 'astro', code: dateSelectorUsage }
    ]
  },
  {
    slug: 'scramble-text',
    title: 'Scramble Text',
    description: 'Text that resolves through an encrypted scramble. Hover to cycle.',
    about:
      'A compact text component that reveals changed text through an encrypted character scramble. It draws itself in the first time it scrolls into view and re-scrambles on hover, cycling through a list of phrases. Motion is disabled automatically when the visitor prefers reduced motion.',
    tags: ['React', 'Animation'],
    Demo: ScrambleTextDemo,
    files: [
      { name: 'ScrambleText.tsx', lang: 'tsx', code: scrambleTextSource },
      { name: 'Usage.astro', lang: 'astro', code: scrambleTextUsage }
    ]
  },
  {
    slug: 'dynamic-button',
    title: 'Dynamic Button',
    description: 'A button that smoothly resizes as its label animates. Click it.',
    about:
      'A button that resizes to fit its label and swaps its icon as the action or state changes. Click it to run through an idle → loading → done state machine; the width transitions between each state using a measure-snap-reflow technique so the resize stays smooth.',
    tags: ['React', 'Animation'],
    Demo: DynamicButtonDemo,
    files: [
      { name: 'DynamicButton.tsx', lang: 'tsx', code: dynamicButtonSource },
      { name: 'Usage.astro', lang: 'astro', code: dynamicButtonUsage }
    ]
  }
]

export const getExperiment = (slug: string) =>
  experiments.find((e) => e.slug === slug)
