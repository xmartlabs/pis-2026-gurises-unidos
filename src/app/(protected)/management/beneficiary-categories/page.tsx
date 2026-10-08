import { auth } from '@/auth';
import { BeneficiaryCategoriesManagement } from '@/components/beneficiary-categories/beneficiary-categories-management';
import { ErrorScreen } from '@/components/error-screen';
import { getBeneficiaryCategoriesWithUsage } from '@/lib/beneficiary-categories';

export default async function BeneficiaryCategoriesPage() {
  const session = await auth();

  if (session?.user.role !== 'admin') {
    return <ErrorScreen code={403} />;
  }

  const categories = await getBeneficiaryCategoriesWithUsage();

  return (
    <div className="bg-primary-foreground flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-[1185px] flex-col gap-1.5 px-6 pt-6 pb-2.5">
          <p className="text-muted-foreground text-sm leading-5 font-normal tracking-normal">
            Administración
          </p>

          <h1 className="text-popover-foreground text-3xl leading-9 font-bold tracking-normal">
            Categorías de beneficiarios
          </h1>

          <p className="text-muted-foreground text-sm leading-4.5 font-normal tracking-normal">
            Categorías de beneficiarios que se cargan en cada proyecto. Las del sistema alimentan
            las métricas públicas y no se pueden eliminar.
          </p>
        </header>

        <div className="bg-surface-page mx-auto flex w-full max-w-[1185px] flex-col gap-5 px-6 pt-6 pb-8">
          <BeneficiaryCategoriesManagement categories={categories} />
        </div>
      </div>
    </div>
  );
}
