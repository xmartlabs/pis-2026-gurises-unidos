import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import icon from '@/app/icon.png';
import red from './red-de-impacto.png';
import { version } from '../../../../package.json';
import { formatNumber } from '@/lib/format';
import { sumBeneficiaries } from '@/lib/project-display';
import prisma from '@/lib/prisma';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 lg:gap-1">
      <p className="text-3xl leading-9 font-bold tracking-normal text-[#EDEDED]">{value}</p>
      <p className="font-sans text-sm leading-5 font-normal tracking-normal text-[#A1A1AA]">
        {label}
      </p>
    </div>
  );
}

function leftColumn() {
  return (
    <div className="lgz:w-140 3xl:min-w-[33%] flex flex-col justify-between gap-6 bg-[#FFFFFF] pt-10 pr-6 pb-8 pl-6 lg:min-w-140 lg:gap-0 lg:pt-14 lg:pr-18 lg:pb-10 lg:pl-18">
      <div className="flex h-11 flex-row gap-2.5 lg:gap-3">
        <Image src={icon} className="h-11 basis-11 rounded-xl" alt="Logo" />
        <div className="flex flex-col gap-1">
          <p className="font-sans text-base leading-6 font-semibold tracking-normal text-[#0A0A0A]">
            Gurises Unidos
          </p>
          <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#737373]">
            ONG Uruguay
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <p className="text-3xl leading-9 font-bold tracking-normal text-[#0A0A0A]">Bienvenido</p>
          <p className="text-sm leading-5 font-normal tracking-normal text-[#737373]">
            Ingresá con tu cuenta para acceder al panel de gestión institucional.
          </p>
        </div>
        <LoginForm />
      </div>
      <footer className="hidden flex-col gap-2 lg:flex">
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#A1A1AA]">
          Plataforma interna de gestión de Gurises Unidos.
        </p>
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#A1A1AA]">
          Versión v{version}
        </p>
      </footer>
    </div>
  );
}

async function rightColumn() {
  const [activeProjects, projects, territories] = await Promise.all([
    prisma.project.count({
      where: {
        status: 'active',
      },
    }),
    prisma.project.findMany({
      include: {
        projectBeneficiaries: true,
      },
    }),
    prisma.department.count(),
  ]);

  const totalReach = projects.reduce(
    (sum, project) =>
      sum +
      project.projectBeneficiaries.reduce(
        (yearSum, beneficiaries) => yearSum + sumBeneficiaries(beneficiaries),
        0
      ),
    0
  );

  return (
    <div className="flex grow flex-col place-content-center gap-4.5 bg-[#0E3A2E] pt-8 pr-6 pb-8 pl-6 lg:gap-12 lg:p-18">
      <div className="flex flex-col gap-4">
        <p className=".leading-4 text-xs leading-4 font-medium tracking-[6%] text-[#F5970C]">
          PLATAFORMA DE GESTIÓN E IMPACTO
        </p>
        <p className="font-sans text-3xl leading-10 font-bold tracking-normal text-[#EDEDED] lg:text-4xl">
          Cada dato cuenta una historia de impacto.
        </p>
        <p className="font-sans text-base leading-6 font-normal tracking-normal text-[#A9C2B8]">
          Gestioná proyectos, territorios y las personas que Gurises Unidos acompaña — todo en un
          mismo lugar.
        </p>
      </div>
      <Image src={red} className="hidden aspect-auto w-150 lg:flex" alt="Red de Impacto" />
      <div className="flex flex-row gap-3 pt-2 lg:gap-10 lg:pt-0">
        <Stat value={String(activeProjects)} label="Proyectos activos" />
        <Stat value={`+${formatNumber(totalReach)}`} label="Personas alcanzadas" />
        <Stat value={String(territories)} label="Territorios" />
      </div>
    </div>
  );
}

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen w-screen flex-col font-sans lg:h-screen lg:flex-row">
      {leftColumn()}
      {await rightColumn()}
      <footer className="flex flex-col gap-0.5 bg-[#FFFFFF] p-6 pt-5 lg:hidden">
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#A1A1AA]">
          Plataforma interna de gestión de Gurises Unidos.
        </p>
        <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#A1A1AA]">
          Versión v{version}
        </p>
      </footer>
    </div>
  );
}
