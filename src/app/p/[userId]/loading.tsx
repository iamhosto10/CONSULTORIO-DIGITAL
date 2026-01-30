import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section - Keeping the background style for continuity, simulating text content */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-50 pb-32 pt-12">
        <div className="container mx-auto px-4 flex flex-col items-center gap-2">
           <Skeleton className="h-8 w-64 bg-white/20" />
           <Skeleton className="h-4 w-48 bg-white/20" />
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-20 space-y-8 pb-12">
        {/* Doctor Card */}
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-xl border-0 overflow-visible">
                <CardContent className="pt-0 relative flex flex-col items-center pb-8">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                        <Skeleton className="h-32 w-32 rounded-full border-4 border-white shadow-lg" />
                    </div>

                    <div className="text-center space-y-4 px-4 w-full flex flex-col items-center">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>

                    <div className="mt-8 w-full max-w-xs">
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Calendar Section */}
        <div className="max-w-4xl mx-auto">
             <div className="mb-6 flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <Skeleton className="h-[500px] w-full rounded-xl" />
             </div>
        </div>
      </main>

       {/* Footer */}
        <footer className="py-8 border-t border-slate-100 flex justify-center">
            <Skeleton className="h-4 w-48" />
        </footer>
    </div>
  )
}
