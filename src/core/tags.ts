/** Fixed protocol tags. "Heads up" remains readable for pre-upgrade saved notes only. */
export const OBSERVER_TAGS = [
  'Requirement drift',
  'Unexpected decision',
  'Execution drift',
  'Wrap up',
  'You should know',
] as const

export type ObserverTag = (typeof OBSERVER_TAGS)[number]
export type StoredTag = ObserverTag | 'Heads up'
