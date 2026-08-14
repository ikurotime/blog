// Shared color language for the "how git works" interactive demos.
// Object types are always color-coded the same way across every widget:
//   blob = emerald, tree = amber, commit = violet.

export interface ObjStyle {
  label: string
  dot: string
  text: string
  chip: string
  node: string
}

export const OBJ: Record<'blob' | 'tree' | 'commit', ObjStyle> = {
  blob: {
    label: 'blob',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    node: 'border-emerald-500/40 bg-emerald-500/10'
  },
  tree: {
    label: 'tree',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    node: 'border-amber-500/40 bg-amber-500/10'
  },
  commit: {
    label: 'commit',
    dot: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    chip: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    node: 'border-violet-500/40 bg-violet-500/10'
  }
}

export interface BranchStyle {
  activeChip: string
  idleChip: string
  dot: string
  text: string
}

// Full static class strings so Tailwind keeps them (no dynamic interpolation).
export const BRANCH_STYLES: BranchStyle[] = [
  {
    activeChip: 'bg-sky-500 text-white',
    idleChip:
      'border border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400'
  },
  {
    activeChip: 'bg-emerald-500 text-white',
    idleChip:
      'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    activeChip: 'bg-amber-500 text-white',
    idleChip:
      'border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400'
  },
  {
    activeChip: 'bg-rose-500 text-white',
    idleChip:
      'border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400'
  }
]

export function branchStyle(i: number): BranchStyle {
  return BRANCH_STYLES[i % BRANCH_STYLES.length]
}
