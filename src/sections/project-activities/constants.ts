import { ProjectCategory } from './project-activity-type'

// Centralized constants to avoid importing heavy components during SSR
export const projectCategory: ProjectCategory[] = [
  'economy',
  'democracy',
  'eu-integrations',
  'culture',
  'intercultural-dialogue',
  'migrations',
  'youth',
  'other',
]

