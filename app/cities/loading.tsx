export default function CitiesLoading() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14" aria-label="Loading cities">
      <div className="h-3 w-20 animate-pulse bg-muted" />
      <div className="mt-4 h-12 w-72 animate-pulse bg-muted" />
      <div className="mt-3 h-4 w-1/2 animate-pulse bg-muted" />
      <div className="mt-8 grid gap-3 border-b border-border pb-5 md:grid-cols-5">
        <div className="h-10 animate-pulse bg-muted md:col-span-2" />
        <div className="h-10 animate-pulse bg-muted" />
        <div className="h-10 animate-pulse bg-muted" />
        <div className="h-10 animate-pulse bg-muted" />
      </div>
      <div className="mt-4 border-t border-border">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[1fr_8rem_6rem] gap-4 border-b border-border py-4">
            <div className="h-5 w-40 animate-pulse bg-muted" />
            <div className="h-5 w-16 animate-pulse bg-muted" />
            <div className="h-5 w-12 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
