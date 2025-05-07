'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  // If loading, show a loading state or a simplified navbar
  if (status === 'loading') {
    return (
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">MediAppoint</span>
          <span className="text-sm">Loading...</span>
        </div>
      </nav>
    );
  }

  // If RootLayout renders Navbar, session should exist after loading.
  // This is a fallback if session becomes unexpectedly null on client.
  if (!session?.user) {
    return null; 
  }

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold hover:text-gray-300">
          MediAppoint
        </Link>
        <div className="space-x-4">
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <span className="text-sm text-gray-400">
            ({session.user.name} - {session.user.role}) {/* session.user.role is type Role */}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })} // After logout, go to root (new login page)
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}