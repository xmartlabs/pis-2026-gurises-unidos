import { ErrorScreen } from '@/components/error-screen';

export default function NotFound() {
  return <ErrorScreen code={404} />;
}
