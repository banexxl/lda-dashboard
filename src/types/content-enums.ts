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

// Legacy Activities category values that predate the current 8-value taxonomy (see
// supabase/migrations/0003_expand_activities_category_check.sql). Not part of
// CATEGORY_VALUES -- never offered as a choice in the category dropdown -- only used
// as a display-label fallback for historical rows that still carry one of these.
export const LEGACY_CATEGORY_LABELS: Record<string, string> = {
     'alda': 'ALDA',
     'dan-evrope': 'Dan Evrope',
     'eu-info-point': 'EU Info Point',
     'evropski-gradovi-interkulturalnosti': 'Evropski gradovi interkulturalnosti',
     'mladi': 'Mladi',
     'mladi-volontiranje-u-inostranstvu': 'Mladi - volontiranje u inostranstvu',
     'mladi-volontiranje-u-subotici': 'Mladi - volontiranje u Subotici',
};
