import { Suspense } from 'react';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import icon from '@/app/icon.png';
import loginImage from '@/assets/login-image.png';
import { version } from '@/lib/version';
import { formatNumber } from '@/lib/format';
import prisma from '@/lib/prisma';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 lg:gap-1">
      <p className="text-3xl leading-9 font-bold tracking-normal text-foreground">{value}</p>
      <p className="font-sans text-sm leading-5 font-normal tracking-normal text-[#A1A1AA]">
        {label}
      </p>
    </div>
  );
}

async function Stats() {
  const [activeProjects, { _sum }, territories] = await Promise.all([
    prisma.project.count({
      where: {
        status: 'active',
      },
    }),
    prisma.projectBeneficiary.aggregate({
      _sum: {
        directChildrenAdolescents: true,
        indirectChildrenAdolescents: true,
        youth18To29: true,
        families: true,
        coordinatedInstitutions: true,
        communityLeaders: true,
        basicServiceStaff: true,
      },
    }),
    prisma.department.count(),
  ]);

  const totalReach =
    (_sum.directChildrenAdolescents ?? 0) +
    (_sum.indirectChildrenAdolescents ?? 0) +
    (_sum.youth18To29 ?? 0) +
    (_sum.families ?? 0) +
    (_sum.coordinatedInstitutions ?? 0) +
    (_sum.communityLeaders ?? 0) +
    (_sum.basicServiceStaff ?? 0);
    
    return (
      <div className="flex flex-row gap-3 pt-2 lg:gap-10 lg:pt-0">
      <Stat value={String(activeProjects)} label="Proyectos activos" />
      <Stat value={`+${formatNumber(totalReach)}`} label="Personas alcanzadas" />
      <Stat value={String(territories)} label="Territorios" />
    </div>
  );
}

function StatsFallback() {
  return (
    <div className="flex flex-row gap-3 pt-2 lg:gap-10 lg:pt-0">
      <Stat value="0" label="Proyectos activos" />
      <Stat value="+0" label="Personas alcanzadas" />
      <Stat value="0" label="Territorios" />
    </div>
  );
}

function RightColumn() {
  return (
    <div className="theme-public flex grow flex-col place-content-center gap-4.5 bg-background pt-8 pr-6 pb-8 pl-6 lg:gap-12 lg:p-18">
      <div className="flex flex-col gap-4">
        <p className="text-xs leading-4 font-medium tracking-[6%] text-primary">
          PLATAFORMA DE GESTIÓN E IMPACTO
        </p>
        <p className="font-sans text-3xl leading-10 font-bold tracking-normal text-foreground lg:text-4xl">
          Cada dato cuenta una historia de impacto.
        </p>
        <p className="font-sans text-base leading-6 font-normal tracking-normal text-muted-foreground">
          Gestioná proyectos, territorios y las personas que Gurises Unidos acompaña — todo en un
          mismo lugar.
        </p>
      </div>
      <Image src={loginImage} className="hidden aspect-auto w-150 lg:flex" alt="Red de Impacto" />
      <Suspense fallback={<StatsFallback />}>
        <Stats />
      </Suspense>
    </div>
  );
}

function LeftColumn() {
  return (
    <div className="lg:w-140 2xl:min-w-[33%] flex flex-col justify-between gap-6 bg-background pt-10 pr-6 pb-8 pl-6 lg:min-w-140 lg:gap-0 lg:pt-14 lg:pr-18 lg:pb-10 lg:pl-18">
      <div className="flex h-11 flex-row gap-2.5 lg:gap-3">
        <Image src={icon} className="h-11 basis-11 rounded-xl" alt="Logo" />
        <div className="flex flex-col gap-1">
          <p className="font-sans text-base leading-6 font-semibold tracking-normal text-primary">
            Gurises Unidos
          </p>
          <p className="font-sans text-xs leading-4 font-normal tracking-normal text-muted-foreground">
            ONG Uruguay
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <p className="text-3xl leading-9 font-bold tracking-normal text-primary">Bienvenido</p>
          <p className="text-sm leading-5 font-normal tracking-normal text-muted-foreground">
            Ingresá con tu cuenta para acceder al panel de gestión institucional.
          </p>
        </div>
        <LoginForm />
      </div>
      <footer className="hidden flex-col gap-2 lg:flex">
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-muted-foreground">
          Plataforma interna de gestión de Gurises Unidos.
        </p>
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-muted-foreground">
          Versión v{version}
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col font-sans lg:h-screen lg:flex-row">
      <LeftColumn />
      <RightColumn />
      <footer className="theme-login flex flex-col gap-0.5 bg-background p-6 pt-5 lg:hidden">
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-muted">
          Plataforma interna de gestión de Gurises Unidos.
        </p>
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-muted">
          Versión v{version}
        </p>
      </footer>
    </div>
  );
}
