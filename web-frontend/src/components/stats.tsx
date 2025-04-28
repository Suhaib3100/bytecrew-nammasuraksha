export default function StatsSection() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Our Impact in Numbers
          </h2>
          <p>
            Empowering users with advanced scam detection and prevention tools to stay safe in today's digital landscape.
          </p>
        </div>

        <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
          <div className="space-y-4">
            <div className="text-5xl font-bold">10,000+</div>
            <p>Scams Detected</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">98.7%</div>
            <p>Detection Accuracy</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">50K+</div>
            <p>Protected Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
