import { useState } from 'react'
import type { Sensor } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { Button } from '@/shared/ui/button'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { useSensorProfile } from '../api/sensors'
import { ProfileDialog } from './profile-dialog'

interface ProfilePanelProps {
  readonly sensor: Sensor
  readonly canEdit: boolean
  readonly onDone: (message: string) => void
}

function Item({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="font-mono text-small">{children}</dd>
    </div>
  )
}

export function ProfilePanel({ sensor, canEdit, onDone }: ProfilePanelProps) {
  const [editing, setEditing] = useState(false)
  const { data: profile, isPending, isError, error, refetch } = useSensorProfile(sensor.id)
  return (
    <Panel aria-labelledby="profile-title">
      <PanelHeader>
        <h2 id="profile-title" className="text-heading-3 font-semibold">
          Perfil operativo
        </h2>
        {canEdit && profile !== undefined && (
          <Button
            className="ml-auto"
            size="sm"
            variant="secondary"
            onClick={() => setEditing(true)}
          >
            {profile ? 'Editar perfil' : 'Definir perfil'}
          </Button>
        )}
      </PanelHeader>
      <PanelBody>
        {isPending && <LoadingState label="Cargando perfil…" />}
        {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
        {profile === null && (
          <EmptyState title="Este sensor no tiene perfil">
            Sin perfil no se evalúan sus lecturas ni se generan incidentes.
          </EmptyState>
        )}
        {profile && (
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Item label="Rango seguro">
              {profile.minTemperature} a {profile.maxTemperature} °C
            </Item>
            <Item label="Media desde">± {profile.magnitudeBands.mediumFrom} °C</Item>
            <Item label="Alta desde">± {profile.magnitudeBands.highFrom} °C</Item>
            <Item label="Crítica desde">± {profile.magnitudeBands.criticalFrom} °C</Item>
            <Item label="Persistencia">
              {profile.persistence.minConsecutiveBreaches} lecturas en{' '}
              {profile.persistence.windowSeconds} s
            </Item>
            <Item label="Intervalo esperado">{profile.expectedReadingIntervalSeconds} s</Item>
            <Item label="Vigencia de calibración">
              {profile.calibrationValiditySeconds
                ? `${profile.calibrationValiditySeconds} s`
                : 'Por defecto'}
            </Item>
            <Item label="Actualizado">{formatDateTime(profile.updatedAt)}</Item>
          </dl>
        )}
      </PanelBody>
      {editing && (
        <ProfileDialog
          sensor={sensor}
          profile={profile}
          onClose={() => setEditing(false)}
          onDone={onDone}
        />
      )}
    </Panel>
  )
}
