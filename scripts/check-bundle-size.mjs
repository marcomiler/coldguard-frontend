// Budgets in gzip kB.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = {
  initialJs: 115,
  initialCss: 8,
  lazyChunk: 30,
  fonts: 30,
}

const dist = 'dist'
const assets = join(dist, 'assets')
const gzipKb = (file) => gzipSync(readFileSync(file)).length / 1024

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const initial = new Set(
  [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]),
)

const failures = []
let initialJs = 0
let initialCss = 0
const report = []

for (const name of readdirSync(assets).filter((f) => /\.(js|css)$/.test(f))) {
  const kb = gzipKb(join(assets, name))
  const isInitial = initial.has(`assets/${name}`)
  report.push(`${isInitial ? 'inicial' : 'lazy   '} ${kb.toFixed(1).padStart(6)} kB  ${name}`)
  if (isInitial && name.endsWith('.js')) initialJs += kb
  else if (isInitial) initialCss += kb
  else if (name.endsWith('.js') && kb > BUDGET_KB.lazyChunk) {
    failures.push(`chunk ${name}: ${kb.toFixed(1)} kB > ${BUDGET_KB.lazyChunk} kB`)
  }

}

const fontsKb = readdirSync(assets)
  .filter((f) => f.endsWith('.woff2'))
  .reduce((total, f) => total + statSync(join(assets, f)).size / 1024, 0)
if (fontsKb > BUDGET_KB.fonts)
  failures.push(`Fuentes: ${fontsKb.toFixed(1)} kB > ${BUDGET_KB.fonts} kB`)

if (initialJs > BUDGET_KB.initialJs)
  failures.push(`JS inicial: ${initialJs.toFixed(1)} kB > ${BUDGET_KB.initialJs} kB`)
if (initialCss > BUDGET_KB.initialCss)
  failures.push(`CSS inicial: ${initialCss.toFixed(1)} kB > ${BUDGET_KB.initialCss} kB`)

console.log(report.sort().join('\n'))
console.log(
  `\nInicial: JS ${initialJs.toFixed(1)}/${BUDGET_KB.initialJs} kB, CSS ${initialCss.toFixed(1)}/${BUDGET_KB.initialCss} kB (gzip), fuentes ${fontsKb.toFixed(1)}/${BUDGET_KB.fonts} kB (woff2)`,
)
if (failures.length) {
  console.error(`\nPresupuesto excedido:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
