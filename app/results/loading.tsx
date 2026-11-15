export default function ResultsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14" aria-label="Loading matches">
      <div className="h-3 w-20 animate-pulse bg-muted" />
      <div className="mt-4 h-12 w-2/3 animate-pulse bg-muted" />
      <div className="mt-3 h-4 w-1/2 animate-pulse bg-muted" />
      <div className="mt-8 flex gap-3">
        <div className="h-9 w-32 animate-pulse bg-muted" />
        <div className="h-9 w-32 animate-pulse bg-muted" />
      </div>
      <div className="mt-8 border-t border-border">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2rem_1fr_8rem] items-center gap-4 border-b border-border py-4 md:grid-cols-[2.5rem_1.7fr_7rem_6.5rem_6.5rem_8rem]"
          >
            <div className="h-3 w-6 animate-pulse bg-muted" />
            <div className="h-4 w-40 animate-pulse bg-muted" />
            <div className="hidden h-4 w-20 animate-pulse bg-muted md:block" />
            <div className="hidden h-4 w-16 animate-pulse bg-muted md:block" />
            <div className="hidden h-4 w-16 animate-pulse bg-muted md:block" />
            <div className="ml-auto h-6 w-24 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
