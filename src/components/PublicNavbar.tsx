'use client';

import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <nav className="bg-teal-600 text-white p-4 shadow-md w-full">
      <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-white">
          MediAppoint
        </Link>
        <div className="space-x-4">
          <Link href="/login" className="hover:text-white bg-teal-700 px-4 py-2 rounded-md transition-colors duration-200">
            Login
          </Link>
          <Link href="/register" className="hover:text-teal-600 bg-white text-teal-600 px-4 py-2 rounded-md transition-colors duration-200">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
