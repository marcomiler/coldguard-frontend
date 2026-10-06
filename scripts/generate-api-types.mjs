import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve(
  process.env.OPENAPI_PATH ?? '../coldguard-platform/contracts/rest/openapi.yaml',
)
const output = resolve('src/shared/api/schema.d.ts')

if (!existsSync(source)) {
  console.error(`No se encontró el contrato OpenAPI en ${source}. Define OPENAPI_PATH.`)
  process.exit(1)
}

execFileSync('pnpm', ['exec', 'openapi-typescript', source, '-o', output], { stdio: 'inherit' })
