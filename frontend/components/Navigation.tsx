'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  const links = [
    {href: '/', label: 'Dashboard'},
    {href: '/dispatch', label: 'Dispatch'},
    {href: '/active-deliveries', label: 'Active'},
    {href: '/completed-deliveries', label: 'History'},
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-dark-nav/80 backdrop-blur-[20px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-black transition-transform duration-200 group-hover:scale-105">
            LM
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-white">Logistics Manager</span>
            <span className="block text-xs text-stone-400">Dispatch operations console</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-md border border-white/10 bg-dark-card p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-stone-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.label === 'Active' && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-emerald"></span>
                    </span>
                  )}
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
