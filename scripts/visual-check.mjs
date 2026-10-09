// Drives the real app with Playwright, once per role, and checks layout and permissions.
// Needs the dev server (`pnpm dev`), the backend running and the demo password:
//   CG_PASS=... pnpm check:visual     (screenshots go to .visual-check/)
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.CG_BASE ?? 'http://localhost:5173'
const PASSWORD = process.env.CG_PASS
const OUT = '.visual-check/'

if (!PASSWORD) {
  console.error('Define CG_PASS con la contraseña de los usuarios demo.')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const failures = []
const check = (ok, message) => {
  console.log(`${ok ? 'OK ' : 'FALLA'} ${message}`)
  if (!ok) failures.push(message)
}

const browser = await chromium.launch()

async function openFirstIncident(
  page,
  row = page.locator('tbody tr', { has: page.locator('a') }).first(),
) {
  await row.locator('a').click()
  await page.waitForURL(/\/incidents\/.+/)
  await page.getByRole('heading', { name: 'Datos' }).waitFor()
  // Let the secondary queries (readings, asset names) settle before asserting.
  await page.waitForTimeout(1500)
}

async function open(user, theme, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport })
  await context.addInitScript((value) => localStorage.setItem('cg-theme', value), theme)
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)))
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)))
  await page.goto(`${BASE}/login`)
  await page.getByLabel('Usuario').fill(user)
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 8000 })
  await page.waitForLoadState('networkidle')
  return { page, context, errors }
}

for (const theme of ['dark', 'light']) {
  {
    const { page, context, errors } = await open('auditor', theme)
    const aside = await page.locator('aside').boundingBox()
    check(
      Math.round(aside.height) === 900,
      `[${theme}] auditor: el sidebar mide el alto de la ventana`,
    )
    check(
      (await page.locator('tbody tr').count()) <= 20,
      `[${theme}] auditor: la tabla pagina (máx. 20 filas)`,
    )
    await page.screenshot({ path: `${OUT}auditor-${theme}.png` })
    await page.mouse.wheel(0, 4000)
    check(
      Math.round((await page.locator('aside').boundingBox()).y) === 0,
      `[${theme}] auditor: el sidebar no se mueve al hacer scroll`,
    )
    await page.locator('summary').first().click()
    const detail = await page.locator('details').first().innerText()
    check(!/[{}]/.test(detail), `[${theme}] auditor: el detalle del cambio es texto, no JSON`)
    await page.screenshot({ path: `${OUT}auditor-${theme}-detalle.png` })
    check(
      (await page.getByRole('button', { name: 'Siguiente' }).count()) === 1,
      `[${theme}] auditor: la paginación está solo debajo de la tabla`,
    )
    check(errors.length === 0, `[${theme}] auditor: sin errores de consola`)
    await context.close()
  }
  {
    const { page, context, errors } = await open('supervisor', theme)
    await page.screenshot({ path: `${OUT}supervisor-${theme}-lista.png` })
    await openFirstIncident(page)
    check(
      (await page.locator('svg[role="img"]').count()) === 1,
      `[${theme}] supervisor: el detalle muestra el gráfico de temperatura`,
    )
    await page.screenshot({ path: `${OUT}supervisor-${theme}-detalle.png`, fullPage: true })
    check(errors.length === 0, `[${theme}] supervisor: sin errores de consola`)
    await context.close()
  }
}

{
  const { page, context } = await open('operator', 'dark')
  check(
    (await page.getByRole('button', { name: 'Reconocer' }).count()) === 0,
    'operador: no ve botones de reconocer',
  )
  await openFirstIncident(page)
  check(
    (await page.locator('main button').count()) === 0,
    'operador: el detalle es de solo lectura',
  )
  check(
    (await page.locator('svg[role="img"]').count()) === 0,
    'operador: sin gráfico (el backend no le da lecturas)',
  )
  await context.close()
}
{
  const { page, context } = await open('technician', 'dark')
  const listButtons = await page.getByRole('button', { name: 'Cerrar', exact: true }).count()
  check(listButtons > 0, 'técnico: la lista tiene el botón Cerrar')
  await openFirstIncident(
    page,
    page
      .locator('tbody tr', { has: page.getByRole('button', { name: 'Cerrar', exact: true }) })
      .first(),
  )
  const buttons = await page.locator('main button').allInnerTexts()
  check(
    buttons.includes('Cerrar incidente') && !buttons.includes('Reconocer'),
    'técnico: puede cerrar y no reconocer',
  )
  await context.close()
}
{
  const { page, context } = await open('supervisor', 'dark', { width: 390, height: 844 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  check(!overflow, 'móvil (390 px): sin scroll horizontal de página')
  await page.screenshot({ path: `${OUT}supervisor-movil.png` })
  await page.getByRole('link', { name: 'Activos' }).click()
  await page.getByRole('heading', { name: 'Activos' }).waitFor()
  check(
    (await page.getByRole('button', { name: 'Registrar unidad' }).count()) === 0,
    'supervisor: no ve Registrar unidad',
  )
  await context.close()
}
{
  const { page, context } = await open('admin', 'dark')
  const register = page.getByRole('button', { name: 'Registrar unidad' })
  check((await register.count()) === 1, 'admin: ve el botón Registrar unidad')
  await register.click()
  await page.getByRole('heading', { name: 'Registrar unidad de frío' }).waitFor()
  await page.screenshot({ path: `${OUT}admin-registrar-unidad.png` })
  await page.getByRole('button', { name: 'Cancelar' }).click()
  const toggle = page.getByRole('switch', { name: 'Tema oscuro' })
  await toggle.click()
  check(
    (await toggle.getAttribute('aria-checked')) === 'false',
    'admin: el interruptor cambia a tema claro',
  )
  await page.screenshot({ path: `${OUT}admin-claro.png` })
  await context.close()
}
{
  const { page, context } = await open('supervisor', 'dark')
  await page.reload()
  await page.getByRole('heading', { name: 'Incidentes', level: 1 }).waitFor()
  check(!page.url().includes('/login'), 'supervisor: la sesión sobrevive a una recarga')
  check(
    (await page.getByRole('list', { name: 'Incidentes por prioridad' }).count()) === 1,
    'supervisor: ve la distribución por prioridad',
  )
  await page.screenshot({ path: `${OUT}supervisor-distribucion.png`, fullPage: true })

  await page.getByRole('link', { name: 'Sensores' }).click()
  await page.getByRole('heading', { name: 'Sensores', level: 1 }).waitFor()
  await page.getByRole('button', { name: 'Ver lecturas del sensor SN-LAC-001' }).click()
  await page.getByRole('heading', { name: /^Temperatura ·/ }).waitFor()
  await page.waitForTimeout(1500)
  check(
    (await page.locator('svg[role="img"]').count()) === 1,
    'supervisor: sensores muestra el gráfico',
  )
  await page.screenshot({ path: `${OUT}supervisor-sensores.png`, fullPage: true })
  await context.close()
}
{
  const { page, context } = await open('admin', 'dark')
  await page.getByRole('link', { name: 'Sensores' }).click()
  await page.getByRole('heading', { name: 'Sensores', level: 1 }).waitFor()
  check(true, 'admin: abre Sensores')
  await context.close()
}
{
  const { page, context } = await open('operator', 'dark')
  check(
    (await page.getByRole('link', { name: 'Sensores' }).count()) === 0,
    'operador: no ve Sensores',
  )
  await context.close()
}
{
  const { page, context, errors } = await open('admin', 'dark')
  await page.getByRole('link', { name: 'Sensores' }).click()
  await page.getByRole('heading', { name: 'Sensores', level: 1 }).waitFor()
  await page.getByRole('button', { name: 'Ver lecturas del sensor SN-LAC-001' }).click()
  await page.getByRole('heading', { name: 'Perfil operativo' }).waitFor()
  await page.getByRole('heading', { name: 'Historial administrativo' }).waitFor()
  await page.waitForTimeout(1500)
  check(
    (await page.getByRole('button', { name: 'Registrar calibración' }).count()) === 1,
    'admin: el sensor muestra sus acciones de gestión',
  )
  await page.screenshot({ path: `${OUT}admin-sensor.png`, fullPage: true })
  for (const [button, title] of [
    ['Cambiar estado', /Cambiar estado de/],
    ['Registrar calibración', /Registrar calibración de/],
    ['Editar datos', /Editar datos de/],
    ['Retirar', /Retirar SN-LAC-001/],
  ]) {
    await page.getByRole('button', { name: button, exact: true }).click()
    await page.getByRole('dialog', { name: title }).waitFor()
    await page.getByRole('button', { name: 'Cancelar' }).click()
  }
  await page.getByRole('button', { name: /^(Editar|Definir) perfil$/ }).click()
  await page.getByRole('dialog', { name: /Perfil operativo de/ }).waitFor()
  await page.screenshot({ path: `${OUT}admin-perfil-dialogo.png` })
  check(true, 'admin: el diálogo de perfil abre')
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await page.getByRole('button', { name: 'Registrar sensor' }).click()
  await page.getByRole('button', { name: 'Registrar sensor' }).last().click()
  check(
    (await page.getByText('Elige la unidad').count()) === 1,
    'admin: registrar sensor valida los campos vacíos',
  )
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await page.getByRole('link', { name: 'Organizaciones' }).click()
  await page.getByRole('heading', { name: 'Organizaciones', level: 1 }).waitFor()
  await page
    .getByRole('button', { name: /^Ver sedes de/ })
    .first()
    .click()
  await page.getByRole('heading', { name: /^Sedes de/ }).waitFor()
  check(
    (await page.getByRole('button', { name: 'Crear sede' }).count()) === 1,
    'admin: organizaciones permite crear sedes',
  )
  await page.screenshot({ path: `${OUT}admin-organizaciones.png`, fullPage: true })

  await page.getByRole('link', { name: 'Activos' }).click()
  await page.getByRole('heading', { name: 'Activos', level: 1 }).waitFor()
  await page
    .getByRole('button', { name: /^Editar / })
    .first()
    .click()
  await page.getByRole('dialog', { name: /^Editar / }).waitFor()
  await page.screenshot({ path: `${OUT}admin-editar-unidad.png` })
  check(true, 'admin: editar unidad abre el diálogo')
  await page.getByRole('button', { name: 'Cancelar' }).click()
  check(errors.length === 0, 'admin: gestión sin errores de consola')
  await context.close()
}
{
  const { page, context } = await open('supervisor', 'dark')
  await page.getByRole('link', { name: 'Sensores' }).click()
  await page.getByRole('heading', { name: 'Sensores', level: 1 }).waitFor()
  await page.getByRole('button', { name: 'Ver lecturas del sensor SN-LAC-001' }).click()
  await page.getByRole('heading', { name: 'Perfil operativo' }).waitFor()
  await page.waitForTimeout(1000)
  check(
    (await page.getByRole('button', { name: /Cambiar estado|Registrar sensor|perfil/ }).count()) ===
      0,
    'supervisor: ve el perfil sin acciones de gestión',
  )
  check(
    (await page.getByRole('heading', { name: 'Historial administrativo' }).count()) === 0,
    'supervisor: no ve el historial administrativo',
  )
  await page.getByRole('link', { name: 'Organizaciones' }).click()
  await page.getByRole('heading', { name: 'Organizaciones', level: 1 }).waitFor()
  check(
    (await page.getByRole('button', { name: 'Crear organización' }).count()) === 0,
    'supervisor: organizaciones es de solo lectura',
  )
  await context.close()
}

await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} comprobaciones fallaron`)
  process.exit(1)
}
