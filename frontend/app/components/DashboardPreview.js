import FadeIn from "./FadeIn";

export default function DashboardPreview() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">A clearer view of the business.</h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to research a company in one place.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Fake Sidebar/Header Preview */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="mt-8 flex flex-col gap-3">
                <div className="h-10 w-full bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800"></div>
                <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
              </div>
            </div>

            {/* Fake Content Preview */}
            <div className="flex-1 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                  <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 w-24 bg-green-100 dark:bg-green-900/30 rounded-md mb-2"></div>
                  <div className="h-4 w-16 bg-green-50 dark:bg-green-900/20 rounded-md ml-auto"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                <div className="h-4 w-4/6 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
}