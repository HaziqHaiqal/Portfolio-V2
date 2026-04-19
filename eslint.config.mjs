import next from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**'] },
  ...next,
  ...nextCoreWebVitals,
]

export default config
