import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-32 lg:px-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-5 h-14 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />

      <div className="mt-12 flex items-center justify-between">
        <Skeleton className="h-11 w-64 rounded-full" />
        <Skeleton className="h-11 w-48 rounded-full" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
