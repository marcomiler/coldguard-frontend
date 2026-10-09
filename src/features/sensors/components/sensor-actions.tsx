import { useState } from 'react'
import { useAssetOptions } from '@/shared/api/asset-names'
import type { Sensor } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import {
  CalibrationDialog,
  EditSensorDialog,
  ReassignDialog,
  RetireDialog,
  StatusDialog,
} from './sensor-dialogs'

type Action = 'status' | 'calibration' | 'reassign' | 'edit' | 'retire'

interface SensorActionsProps {
  readonly sensor: Sensor
  readonly onDone: (message: string) => void
}

/** Administrator-only operations; the backend still decides which transitions are valid. */
export function SensorActions({ sensor, onDone }: SensorActionsProps) {
  const [open, setOpen] = useState<Action | null>(null)
  const assets = useAssetOptions(open === 'reassign')
  const close = () => setOpen(null)
  const retired = sensor.status === 'RETIRED'
  const dialog = { sensor, onClose: close, onDone }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {!retired && (
          <>
            <Button variant="secondary" onClick={() => setOpen('status')}>
              Cambiar estado
            </Button>
            <Button variant="secondary" onClick={() => setOpen('calibration')}>
              Registrar calibración
            </Button>
            {sensor.status === 'IN_MAINTENANCE' && (
              <Button variant="secondary" onClick={() => setOpen('reassign')}>
                Reasignar
              </Button>
            )}
          </>
        )}
        <Button variant="secondary" onClick={() => setOpen('edit')}>
          Editar datos
        </Button>
        {!retired && (
          <Button variant="danger" onClick={() => setOpen('retire')}>
            Retirar
          </Button>
        )}
      </div>
      {open === 'status' && <StatusDialog {...dialog} />}
      {open === 'calibration' && <CalibrationDialog {...dialog} />}
      {open === 'reassign' && <ReassignDialog {...dialog} assets={assets.data?.items ?? []} />}
      {open === 'edit' && <EditSensorDialog {...dialog} />}
      {open === 'retire' && <RetireDialog {...dialog} />}
    </>
  )
}
