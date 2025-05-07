import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // If user is already authenticated, redirect them to the dashboard
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-700 text-white py-20 w-full">
        <div className="w-full max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">MediAppoint</h1>
          <p className="text-xl mb-8">Simplifying healthcare appointments for everyone</p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
              Create Account
            </Link>
            <Link href="/login" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 w-full max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="bg-teal-100 text-teal-600 w-12 h-12 flex items-center justify-center rounded-full mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">For Patients</h3>
            <p className="text-gray-600 text-center">Book appointments with specialists, manage your schedule, and receive reminders for upcoming visits.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="bg-teal-100 text-teal-600 w-12 h-12 flex items-center justify-center rounded-full mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">For Doctors</h3>
            <p className="text-gray-600 text-center">View your appointment schedule, manage patient bookings, and organize your daily medical practice.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="bg-teal-100 text-teal-600 w-12 h-12 flex items-center justify-center rounded-full mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">For Administrators</h3>
            <p className="text-gray-600 text-center">Manage users, oversee appointment scheduling, and maintain the system for optimal healthcare delivery.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16 w-full">
        <div className="w-full max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join MediAppoint today and experience a seamless healthcare appointment management system.</p>
          <Link href="/register" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition duration-300">
            Register Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 w-full">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">MediAppoint</h3>
              <p className="text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-400 hover:text-white transition duration-300">
                Login
              </Link>
              <Link href="/register" className="text-gray-400 hover:text-white transition duration-300">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}