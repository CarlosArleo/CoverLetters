import { CoverCraftApp } from '@/components/app/cover-craft-app';

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Strategic Application Engine
          </h1>
          <p className="text-muted-foreground mt-2 text-lg md:text-xl max-w-2xl mx-auto">
            Generate hyper-personalized cover letters with the power of AI.
          </p>
        </header>
        <CoverCraftApp />
      </main>
    </div>
  );
}
