import Image from 'next/image';
import { LoginForm } from './login-form';
import icon from '@/app/icon.png';
import red from './red-de-impacto.png';
import { version } from '../../../../package.json';
import { formatNumber } from '@/lib/format';
import { ANNUAL_REACH } from '@/lib/projects';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 lg:gap-1">
      <p className="text-3xl font-bold leading-9 tracking-normal text-[#EDEDED]">{value}</p>
      <p className="text-sm font-sans font-normal leading-5 tracking-normal text-[#A1A1AA]">{label}</p>
    </div>
  );
}

function leftColumn(){
  return (
    <div className="lg:min-w-140 lgz:w-140 3xl:min-w-[33%] flex flex-col justify-between pt-10 lg:pt-14 pr-6 lg:pr-18 pb-8 lg:pb-10 pl-6 lg:pl-18 gap-6 lg:gap-0 bg-[#FFFFFF]">
      <div className="flex h-11 flex-row gap-2.5 lg:gap-3">
        <Image src={icon} className="basis-11 h-11 rounded-xl" alt="Logo" />
        <div className="flex flex-col gap-1">
          <p className="text-base leading-6 tracking-normal font-semibold font-sans text-[#0A0A0A]">Gurises Unidos</p>
          <p className="text-xs font-sans font-normal leading-4 tracking-normal text-[#737373]">ONG Uruguay</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5 lg:gap-2">
          <p className="text-3xl font-bold leading-9 tracking-normal text-[#0A0A0A]">Bienvenido</p>
          <p className="text-sm font-normal leading-5 tracking-normal text-[#737373]">Ingresá con tu cuenta para acceder al panel de gestión institucional.</p>
        </div>  
        <LoginForm />
      </div>
      <footer className="hidden lg:flex flex-col gap-2">
        <p className="text-xs font-sans font-normal leading-4 tracking-normal text-[#A1A1AA]">Plataforma interna de gestión de Gurises Unidos.</p>
        <p className="text-xs font-sans font-normal leading-4 tracking-normal text-[#A1A1AA]">Version {version}</p>
      </footer>
    </div>
  )
}

async function rightColumn() {
  const totalReach = ANNUAL_REACH[ANNUAL_REACH.length - 1].reach;
  return(
    <div className="flex flex-col place-content-center gap-4.5 lg:gap-12 pt-8 pr-6 pb-8 pl-6 lg:p-18 grow bg-[#0E3A2E]">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium leading-4 tracking-[6%] .leading-4 text-[#F5970C]">PLATAFORMA DE GESTIÓN E IMPACTO</p>
        <p className="text-3xl lg:text-4xl font-sans font-bold leading-10 tracking-normal text-[#EDEDED]">Cada dato cuenta una historia de impacto.</p>
        <p className="text-base font-sans font-normal leading-6 tracking-normal text-[#A9C2B8]">
          Gestioná proyectos, territorios y las personas que Gurises Unidos acompaña — todo en un mismo lugar.
        </p>
      </div>
      <Image src={red} className="hidden lg:flex w-150 aspect-auto" alt="Red de Impacto" />
      <div className=" flex flex-row pt-2 lg:pt-0 gap-3 lg:gap-10">
        <Stat value={"27"} label="Proyectos Activos" />
        <Stat value={`+${formatNumber(totalReach)}`} label="Personas alcanzadas" />
        <Stat value={"3"} label="Territorios" />
      </div>
    </div>
  )
}

export default async function LoginPage() {
  

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-screen font-sans">
      {leftColumn()}
      {await rightColumn()}
      <footer className="flex lg:hidden p-6 pt-5 flex-col gap-0.5 bg-[#FFFFFF]">
        <p className="text-xs font-sans font-normal leading-4 tracking-normal text-[#A1A1AA]">Plataforma interna de gestión de Gurises Unidos.</p>
        <p className="text-xs font-sans font-normal leading-4 tracking-normal text-[#A1A1AA]">Version {version}</p>
      </footer>
    </div>
  );
}

