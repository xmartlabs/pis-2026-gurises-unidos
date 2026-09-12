'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Activo',
    className: 'bg-[#e1faec] text-[#16a34b]',
  },
  {
    value: 'pendingInvitation',
    label: 'Invitación pendiente',
    className: 'bg-[#fff8e0] text-[#a96104]',
  },
  {
    value: 'disabled',
    label: 'Deshabilitado',
    className: 'bg-muted text-foreground',
  },
];

export function UserForm() {
  return (
    <form className="mt-6 grid gap-6 lg:grid-cols-[760px_minmax(20rem,1fr)]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Datos personales</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre" name="firstName" placeholder="Ej. Ana" />
              <Field label="Apellido" name="lastName" placeholder="Ej. García" />
              <Field label="Documento (Cédula)" name="documentId" placeholder="1.234.567-8" />
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="nombre@gurises-unidos.org.uy"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Permisos</CardTitle>
          </CardHeader>

          <CardContent>
            <Label htmlFor="role" className="text-xs">
              Rol
            </Label>

            <NativeSelect
              id="role"
              name="role"
              defaultValue="admin"
              className="mt-1 w-full max-w-sm"
            >
              <NativeSelectOption value="admin">Administrador</NativeSelectOption>
              <NativeSelectOption value="coordinator">Coordinador</NativeSelectOption>
            </NativeSelect>

            <p className="text-muted-foreground mt-2 text-xs">
              Los administradores pueden gestionar usuarios y configurar el sistema.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado</CardTitle>
          </CardHeader>

          <CardContent>
            <RadioGroup name="status" defaultValue="active" className="gap-2">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={option.value}
                    value={option.value}
                    className="size-4 border border-[#e5e5e5] bg-white shadow-[0_1px_2px_0_rgb(0_0_0/0.1)] data-checked:border-[#e5e5e5] data-checked:bg-white [&_[data-slot=radio-group-indicator]>span]:size-[6.67px] data-checked:[&_[data-slot=radio-group-indicator]>span]:bg-[#1a1a1a]"
                  />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    <Badge className={option.className}>{option.label}</Badge>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Seguridad</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Contraseña temporal"
                name="temporaryPassword"
                type="password"
                placeholder="Se genera automáticamente"
              />
              <Field
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                placeholder="Repetí la contraseña"
              />
            </div>

            <Button type="button" variant="outline" size="sm" className="mt-4">
              Generar contraseña automáticamente
            </Button>

            <p className="text-muted-foreground mt-3 text-xs">
              El administrador comparte esta contraseña con la persona. El ingreso al sistema es por
              cédula.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">Información</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-xs">Se completarán una vez creado el usuario.</p>

          <dl className="mt-4 space-y-3">
            <InfoRow label="Fecha de creación" />
            <InfoRow label="Último acceso" />
            <InfoRow label="Creado por" />
            <InfoRow label="Última modificación" />
          </dl>
        </CardContent>
      </Card>

      <div className="border-border bg-card items- center sticky bottom-0 z-10 col-span-full -mx-6 flex h-[68px] justify-between border-t px-6">
        <Button type="button" variant="ghost" size="sm">
          Cancelar
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Guardar borrador
          </Button>
          <Button type="submit" size="sm">
            Guardar usuario
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

function InfoRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <dt>{label}</dt>
      <dd className="text-muted-foreground">—</dd>
    </div>
  );
}
