export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center px-3 pb-24 pt-10 sm:px-8 sm:py-14">
      <div className="relative mx-auto w-full max-w-6xl">
        <div
          aria-hidden
          className="absolute -inset-x-3 -top-4 bottom-4 -z-10 rotate-[-1.5deg] rounded-[2.5rem] bg-[#dfe3bd]"
        />

        <div className="page-enter relative rounded-tl-[3.5rem] rounded-tr-2xl rounded-bl-2xl rounded-br-[3.5rem] bg-[#fdfcf8] p-6 shadow-[0_40px_80px_-30px_rgba(46,58,26,0.35)] sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}
