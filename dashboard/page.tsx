import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjusted path
import { redirect } from 'next/navigation';
import PatientDashboard from '@/components/dashboard/PatientDashboard'; // New import
import DoctorDashboard from '@/components/dashboard/DoctorDashboard'; // New import
import AdminDashboard from '@/components/dashboard/AdminDashboard'; // New import

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // This should ideally not happen if layout.tsx protects routes correctly
    // and Navbar is only shown to authenticated users.
    // But as a fallback, redirect to login.
    redirect('/');
  }

  const { user } = session;
  let roleSpecificContent = null;

  if (user.role === 'PATIENT') {
    if (user.patientId) {
      roleSpecificContent = <PatientDashboard patientId={user.patientId} />;
    } else {
      roleSpecificContent = <p className="text-red-500">Error: Patient profile ID is missing.</p>;
    }
  } else if (user.role === 'DOCTOR') {
    if (user.doctorId) {
      roleSpecificContent = <DoctorDashboard doctorId={user.doctorId} />;
    } else {
      roleSpecificContent = <p className="text-red-500">Error: Doctor profile ID is missing.</p>;
    }
  } else if (user.role === 'ADMIN') {
    if (user.id) { // Assuming admin uses the general user.id
      roleSpecificContent = <AdminDashboard adminId={user.id} />;
    } else {
      roleSpecificContent = <p className="text-red-500">Error: Admin user ID is missing.</p>;
    }
  } else {
    roleSpecificContent = <p>No specific dashboard view for your role.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name ?? 'User'}!</h1>
        <p className="text-md text-gray-600">Your role: <span className="font-semibold">{user.role}</span></p>
      </div>
      {roleSpecificContent}
    </div>
  );
}