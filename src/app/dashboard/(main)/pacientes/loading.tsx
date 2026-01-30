import { Skeleton } from "@/components/ui/skeleton"

export default function PatientsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* PatientsHeader imitation */}
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>

      <div className="flex items-center justify-between gap-2 md:mt-8">
        {/* Search */}
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Mobile View */}
            <div className="md:hidden space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-2 w-full rounded-md bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <Skeleton className="h-3 w-[100px]" />
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden min-w-full md:block">
                <div className="rounded-lg bg-gray-50">
                    {/* Table Header */}
                    <div className="border-b bg-gray-50 p-4">
                         <div className="flex w-full">
                            <Skeleton className="h-4 w-full" />
                         </div>
                    </div>

                    <div className="bg-white">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center border-b px-4 py-3 last:border-none">
                                <div className="flex-1 space-y-1 pl-2">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[200px]" />
                                </div>
                                <div className="flex-1 px-3">
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                                <div className="flex-1 px-3">
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                                <div className="flex justify-end gap-3 pl-6 pr-3">
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

       {/* Pagination */}
       <div className="mt-5 flex w-full justify-center">
         <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
         </div>
      </div>
    </div>
  )
}
