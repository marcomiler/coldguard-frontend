import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'
const TOKENS = 'src/styles/tokens.css'
const BASE = 'src/styles/base.css'
const ALLOWED_CSS = new Set([TOKENS, BASE, 'src/index.css'])

const COLORS = [
  'bg',
  'surface',
  'surface-raised',
  'surface-hover',
  'overlay',
  'fg',
  'fg-muted',
  'border',
  'border-strong',
  'accent',
  'accent-hover',
  'accent-fg',
  'accent-subtle',
  'accent-subtle-fg',
  'focus',
  ...['neutral', 'info', 'success', 'warning', 'danger'].flatMap((t) => [
    t,
    `${t}-subtle`,
    `${t}-fg`,
  ]),
]
const TEXT_ROLES = ['caption', 'small', 'body', 'heading-3', 'heading-2', 'heading-1', 'metric']
const REQUIRED_TOKENS = [
  ...COLORS.map((c) => `--color-${c}`),
  '--font-sans',
  '--font-mono',
  ...TEXT_ROLES.flatMap((r) => [`--text-${r}`, `--text-${r}--line-height`]),
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-full',
  '--shadow-raised',
  '--shadow-overlay',
  '--focus-ring-width',
  '--focus-ring-offset',
  '--target-min',
  '--z-sticky',
  '--z-overlay',
  '--z-toast',
  '--duration-fast',
  '--duration-base',
]

const PALETTES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const PROPS =
  'bg|text|border|ring|outline|fill|stroke|from|to|via|divide|decoration|accent|caret|shadow|placeholder'
const BRACKET_OK = /^(?:[a-z-]+:)*(?:data|aria|supports|has|group|peer|in|not|nth)-\[/

const RULES = [
  {
    id: 'color-literal',
    re: /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/,
    msg: 'Color literal: usa un token semántico (bg-surface, text-fg…)',
  },
  {
    id: 'palette-class',
    re: new RegExp(
      `(?<![\\w-])(?:[a-z-]+:)*(?:${PROPS})-(?:(?:${PALETTES})-\\d{2,3}|black|white)(?:/\\d+)?(?![\\w-])`,
    ),
    msg: 'Clase de paleta por defecto: no existe en este sistema; usa tokens semánticos',
  },
  {
    id: 'dark-variant',
    re: /(?<![\w-])dark:/,
    msg: '`dark:` prohibido: el tema lo resuelven los tokens (light-dark())',
  },
  {
    id: 'removed-scale',
    re: /(?<![\w-])(?:[a-z-]+:)*(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|rounded(?=[\s"'`])|rounded-(?:xs|xl|2xl|3xl)|shadow-(?:2xs|xs|sm|md|lg|xl|2xl)|font-serif)(?![\w-])/,
    msg: 'Escala eliminada: usa los roles text-*, rounded-sm|md|lg|full y shadow-raised|overlay',
  },
  {
    id: 'inline-style',
    re: /\bstyle=\{/,
    msg: 'style={} prohibido: usa utilidades de Tailwind (o una variable CSS para valores dinámicos)',
  },
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const failures = []
const fail = (file, line, msg) =>
  failures.push(`${relative('.', file)}${line ? `:${line}` : ''}  ${msg}`)

for (const file of walk(ROOT)) {
  const rel = relative('.', file)
  const isCss = file.endsWith('.css')
  const isCode = /\.(ts|tsx)$/.test(file) && !/\.test\.|\.d\.ts$|^src\/(mocks|test)\//.test(rel)

  if (isCss) {
    if (!ALLOWED_CSS.has(rel))
      fail(
        file,
        0,
        'CSS propio no permitido: solo tokens.css, base.css e index.css (los componentes usan utilidades)',
      )
    const css = readFileSync(file, 'utf8').split('\n')
    css.forEach((text, i) => {
      if (text.includes('design-allow:')) return
      if (rel !== BASE && /@apply|!important/.test(text))
        fail(file, i + 1, '@apply y !important solo en base.css')
      if (rel !== TOKENS && RULES[0].re.test(text))
        fail(file, i + 1, 'Color literal fuera de tokens.css')
    })
    continue
  }
  if (!isCode) continue

  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((text, i) => {
      if (text.includes('design-allow:')) return
      for (const rule of RULES)
        if (rule.re.test(text)) fail(file, i + 1, `[${rule.id}] ${rule.msg}`)
      for (const m of text.matchAll(/[^\s"'`{}()]*-\[[^\]]+\][^\s"'`{}()]*/g)) {
        if (!BRACKET_OK.test(m[0]))
          fail(
            file,
            i + 1,
            `[arbitrary-value] \`${m[0]}\`: valores arbitrarios prohibidos; usa la escala o crea un token`,
          )
      }
    })
}

const tokens = readFileSync(TOKENS, 'utf8')
for (const token of REQUIRED_TOKENS) {
  if (!new RegExp(`${token.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:`).test(tokens))
    fail(TOKENS, 0, `Falta el token requerido ${token}`)
}

if (failures.length) {
  console.error(`Reglas de diseño incumplidas (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Reglas de diseño: OK')
