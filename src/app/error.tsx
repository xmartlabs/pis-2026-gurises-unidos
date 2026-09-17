'use client';

import { ErrorScreen } from '@/components/error-screen';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorScreen
      code={500}
      reference={error.digest}
      actions={
        <Button size="lg" onClick={() => retry()}>
          Intentar de nuevo
        </Button>
      }
    />
  );
}
