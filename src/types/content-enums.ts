export const CATEGORY_VALUES = [
     'economy',
     'democracy',
     'eu-integrations',
     'culture',
     'intercultural-dialogue',
     'migrations',
     'youth',
     'other',
] as const;

export type Category = (typeof CATEGORY_VALUES)[number];

export const STATUS_VALUES = ['completed', 'in-progress', 'to-do'] as const;

export type Status = (typeof STATUS_VALUES)[number];

export const LOCALE_VALUES = ['sr', 'en'] as const;

export type Locale = (typeof LOCALE_VALUES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
     'other': 'Ostalo',
     'eu-integrations': 'EU integracije',
     'intercultural-dialogue': 'Interkulturalni dijalog',
     'migrations': 'Migracije',
     'youth': 'Mladi',
     'culture': 'Kultura',
     'economy': 'Ekonomija',
     'democracy': 'Demokratija',
};

export const STATUS_LABELS: Record<Status, string> = {
     'completed': 'Zavrsen',
     'in-progress': 'U toku',
     'to-do': 'U planu',
};
