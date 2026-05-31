'use client';

import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-blue-100">
           Logistics Manager
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-blue-100 transition">Home</Link>
          <Link href="/dispatch" className="hover:text-blue-100 transition">New Dispatch</Link>
          <Link href="/active-deliveries" className="hover:text-blue-100 transition">Active Deliveries</Link>
          <Link href="/completed-deliveries" className="hover:text-blue-100 transition">Completed</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;