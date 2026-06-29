export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 px-3 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] bg-[#fdfcf8] p-6 shadow-2xl shadow-black/15 sm:p-10">
        {children}
      </div>
    </main>
  );
}
