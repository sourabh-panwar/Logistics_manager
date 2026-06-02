'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Route, LayoutDashboard, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

const CountUp = ({ end, duration }: { end: number, duration: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toString().padStart(2, '0')}</span>;
};

const metrics = [
  {label: 'Planning stages', value: 4, detail: 'Warehouse, orders, fleet, review'},
  {label: 'Route constraints', value: 2, detail: 'Capacity and daily distance'},
  {label: 'Dispatch states', value: 3, detail: 'Assigned, active, completed'},
  {label: 'Review surfaces', value: 3, detail: 'Map, manifest, history'},
];

const workflow = [
  'Set the warehouse position on the map',
  'Register delivery locations and weights',
  'Add trucks with capacity and range limits',
  'Generate a colored dispatch manifest',
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-main px-5 py-8 text-stone-200 bg-dot-pattern">
        <div className="mx-auto max-w-7xl animate-fade-in">
          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-dark-card p-8 shadow-2xl animate-slide-up">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="w-full h-full text-white fill-current">
                   <path d="M0,500 C200,300 400,700 600,400 C800,100 1000,500 1000,500 L1000,1000 L0,1000 Z" opacity="0.5"/>
                   <path d="M0,600 C300,800 600,300 1000,700 L1000,1000 L0,1000 Z"/>
                </svg>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">Dispatch control</p>
                    <div className="flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1">
                      <span className="flex h-1.5 w-1.5 items-center justify-center">
                        <span className="absolute inline-flex h-2 w-2 animate-pulse-slow rounded-full bg-accent-emerald"></span>
                      </span>
                      <span className="text-[10px] font-semibold text-accent-emerald">Backend FastAPI ready</span>
                    </div>
                  </div>
                  <h1 className="mt-4 font-serif text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-[56px]">
                    Plan fleet routes with a clean operating view.
                  </h1>
                </div>

                <div className="hidden lg:flex relative h-32 w-48 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-dark-panel shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded bg-black/50 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500 absolute"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 relative"></span>
                    <span className="text-[9px] font-bold tracking-wider text-white">LIVE</span>
                  </div>
                  <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-80">
                    <circle cx="20" cy="40" r="4" fill="#FFFFFF"/>
                    <circle cx="50" cy="20" r="3" fill="#00D9A3"/>
                    <circle cx="90" cy="30" r="3" fill="#00D9A3"/>
                    <circle cx="70" cy="60" r="3" fill="#00D9A3"/>
                    <path d="M20,40 L50,20 L90,30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <path d="M20,40 L70,60 L90,30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 2"/>
                  </svg>
                </div>
              </div>

              <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, i) => (
                  <div key={metric.label} className="group flex flex-col rounded-xl border border-white/10 bg-dark-stat p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)]" style={{animationDelay: `${(i+1)*100}ms`}}>
                    <p className="text-5xl font-extrabold text-white">
                      <CountUp end={metric.value} duration={1200} />
                    </p>
                    <p className="mt-3 text-sm font-semibold text-stone-200">{metric.label}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{metric.detail}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dispatch"
                  className="rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:scale-[1.03]"
                >
                  New dispatch
                </Link>
                <Link
                  href="/active-deliveries"
                  className="rounded-lg border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/5"
                >
                  View active fleet
                </Link>
              </div>
            </div>

            <aside className="relative flex flex-col rounded-xl border border-white/5 bg-dark-panel p-8 shadow-xl animate-slide-up" style={{animationDelay: '100ms'}}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Demo flow</p>
              
              <div className="relative mt-8 flex-1 space-y-6 pb-4">
                <div className="absolute left-[15px] top-4 bottom-8 w-[2px] bg-white/5">
                  <div className="w-full bg-white animate-line-draw origin-top"></div>
                </div>

                {workflow.map((item, index) => (
                  <div key={item} className="relative z-10 flex gap-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-dark-main text-xs font-bold text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-6 text-stone-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <p className="text-sm font-semibold text-white">Reviewer note</p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  The route engine stores dispatches, tracks active assignments, and keeps completed history for audit.
                </p>
              </div>
            </aside>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3 pb-10">
            {[
              {title: 'Route engine', icon: Route, copy: 'Clusters deliveries, sequences stops, and assigns routes to trucks using weight and distance limits.'},
              {title: 'Operations board', icon: LayoutDashboard, copy: 'Separates active dispatches from completed history so the demo has a clear lifecycle.'},
              {title: 'Map-first review', icon: MapPin, copy: 'Colored route lines make the dispatch plan inspectable before it is activated.'},
            ].map((feature, i) => (
              <div key={feature.title} className="group relative overflow-hidden rounded-xl border border-white/5 bg-dark-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-dark-hover animate-slide-up" style={{animationDelay: `${(i+2)*100}ms`}}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                <feature.icon className="mb-5 h-7 w-7 text-white" />
                <p className="text-lg font-bold text-white">{feature.title}</p>
                <p className="mt-3 text-sm leading-6 text-stone-400">{feature.copy}</p>
                <p className="mt-6 text-sm font-semibold text-white opacity-80 transition-opacity group-hover:opacity-100">
                  Learn more &rarr;
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
