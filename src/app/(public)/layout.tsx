export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-public flex min-h-full flex-1 flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
