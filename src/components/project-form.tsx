'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createProject } from '@/app/actions/projects';
import type { ProjectFormState } from '@/lib/validation/project';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inProgress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
];

const INTENSITY_OPTIONS = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
];

const ZONE_OPTIONS = [
  { value: 'city', label: 'Montevideo' },
  { value: 'inland', label: 'Interior' },
  { value: 'border', label: 'Frontera' },
  { value: 'rural', label: 'Rural' },
];

const initialState: ProjectFormState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-destructive mt-1 text-xs">{messages[0]}</p>;
}

export function ProjectForm({
  coordinators,
  departments,
}: {
  coordinators: { id: number; firstName: string; lastName: string }[];
  departments: { id: number; name: string }[];
}) {
  const [state, formAction] = useActionState(createProject, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {state.formError && (
        <p className="border-destructive bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {state.formError}
        </p>
      )}

      <section className="border-border bg-card space-y-5 rounded-xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">Información básica</h2>

        <div>
          <label htmlFor="name" className="text-muted-foreground text-sm">
            Nombre del proyecto
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ej: Espacio joven Malvín Norte"
            className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
          <FieldError messages={state.errors?.name} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="text-muted-foreground text-sm">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue="active"
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="intensity" className="text-muted-foreground text-sm">
              Intensidad
            </label>
            <select
              id="intensity"
              name="intensity"
              defaultValue="medium"
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              {INTENSITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startYear" className="text-muted-foreground text-sm">
              Año de inicio
            </label>
            <input
              id="startYear"
              name="startYear"
              type="number"
              defaultValue={new Date().getFullYear()}
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
            <FieldError messages={state.errors?.startYear} />
          </div>

          <div>
            <label htmlFor="leadCoordinatorId" className="text-muted-foreground text-sm">
              Coordinador responsable
            </label>
            <select
              id="leadCoordinatorId"
              name="leadCoordinatorId"
              defaultValue=""
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Seleccionar coordinador...
              </option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.firstName} {coordinator.lastName}
                </option>
              ))}
            </select>
            <FieldError messages={state.errors?.leadCoordinatorId} />
          </div>
        </div>
      </section>

      <section className="border-border bg-card space-y-5 rounded-xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">Territorio</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="departmentId" className="text-muted-foreground text-sm">
              Departamento
            </label>
            <select
              id="departmentId"
              name="departmentId"
              defaultValue=""
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Seleccionar...
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.errors?.departmentId} />
          </div>

          <div>
            <label htmlFor="localityNeighborhood" className="text-muted-foreground text-sm">
              Localidad / Barrio
            </label>
            <input
              id="localityNeighborhood"
              name="localityNeighborhood"
              type="text"
              placeholder="Ej: Malvín Norte"
              className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="zone" className="text-muted-foreground text-sm">
            Zona
          </label>
          <select
            id="zone"
            name="zone"
            defaultValue="city"
            className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            {ZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="border-border bg-card space-y-5 rounded-xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">Información pública</h2>
        <p className="text-muted-foreground text-sm">
          Aparece en la vista pública para donantes y aliados.
        </p>

        <div>
          <label htmlFor="generalObjective" className="text-muted-foreground text-sm">
            Objetivo general
          </label>
          <input
            id="generalObjective"
            name="generalObjective"
            type="text"
            placeholder="Ej: Acompañando a jóvenes en situación de vulnerabilidad"
            className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="publicDescription" className="text-muted-foreground text-sm">
            Descripción pública
          </label>
          <textarea
            id="publicDescription"
            name="publicDescription"
            maxLength={300}
            rows={3}
            placeholder="Contá de qué trata el proyecto, a quiénes ayuda y cuál es su impacto..."
            className="border-border bg-card text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
          <FieldError messages={state.errors?.publicDescription} />
          <p className="text-muted-foreground mt-1 text-xs">Máx. 300 caracteres</p>
        </div>
      </section>

      <section className="border-border bg-card space-y-5 rounded-xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">Notas internas</h2>
        <p className="text-muted-foreground text-sm">
          Comentarios para el equipo. No se muestran en la vista pública.
        </p>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={3}
          placeholder="Escribí un comentario para el equipo..."
          className="border-border bg-card text-foreground w-full rounded-lg border px-3 py-2 text-sm"
        />
      </section>

      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm hover:opacity-90"
        >
          Crear proyecto
        </button>
      </div>
    </form>
  );
}
