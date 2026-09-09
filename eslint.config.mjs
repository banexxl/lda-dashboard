import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Not extending eslint-config-next/typescript: its typescript-eslint "recommended"
// rules (no-explicit-any, etc.) would flag hundreds of pre-existing `any` usages
// across this codebase's loosely-typed form/table components -- a pre-existing style,
// not something introduced by this migration. core-web-vitals (React/Next/a11y/hooks
// rules) is the part actually worth enforcing here.
const eslintConfig = [
     ...nextCoreWebVitals,
     {
          ignores: ['.next/**', 'node_modules/**'],
     },
];

export default eslintConfig;
