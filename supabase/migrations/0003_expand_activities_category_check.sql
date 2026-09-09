-- LDA Dashboard: grandfather in legacy Activities category values.
--
-- The Mongo `Activities` collection (the site's oldest content type, going back to
-- 2008) has 7 category slugs that predate the current 8-value taxonomy used by the
-- admin form's dropdown (CATEGORY_VALUES in src/types/content-enums.ts):
--   alda, dan-evrope, eu-info-point, evropski-gradovi-interkulturalnosti, mladi,
--   mladi-volontiranje-u-inostranstvu, mladi-volontiranje-u-subotici
--
-- 0001_init.sql's activities_category_check only allowed the current 8 values, which
-- rejected every row using one of these legacy values during the Mongo -> Supabase data
-- migration. This widens the constraint to accept both sets, preserving the historical
-- categorization instead of forcing a lossy remap. The admin form's dropdown is
-- deliberately NOT widened to offer these as choices for new/edited content -- they're
-- accepted on read/write of existing data, not offered going forward.

alter table activities drop constraint activities_category_check;

alter table activities add constraint activities_category_check
     check (category in (
          -- current taxonomy
          'economy', 'democracy', 'eu-integrations', 'culture',
          'intercultural-dialogue', 'migrations', 'youth', 'other',
          -- legacy values, grandfathered in for historical rows only
          'alda', 'dan-evrope', 'eu-info-point', 'evropski-gradovi-interkulturalnosti',
          'mladi', 'mladi-volontiranje-u-inostranstvu', 'mladi-volontiranje-u-subotici'
     ));
