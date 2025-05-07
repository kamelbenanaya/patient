// c:\Users\Roxx9\Desktop\j2ee\src\components\dashboard\PatientDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of an Appointment object based on API response
interface Appointment {
  id: string;
  appointmentDate: string; // or Date
  doctorId: string;
  patientId: string;
  status: string; // e.g., 'SCHEDULED', 'COMPLETED', 'CANCELLED'
  reason: string | null;
  notes: string | null;
  createdAt: string; // or Date
  updatedAt: string; // or Date
  doctor: { // Nested doctor information
    user: {
      name: string | null;
    };
    specialization: string | null; // Added specialization
  } | null; // Doctor might be null if not included or for some reason
}

interface PatientDashboardProps {
  patientId: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientId }) => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/appointments'); // Fetch from our API
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message ?? `Failed to fetch appointments: ${response.statusText}`);
        }
        const data: Appointment[] = await response.json();
        setAppointments(data);
      } catch (err: any) {
        setError(err.message ?? 'An unexpected error occurred.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]); // Re-fetch if patientId changes, though it's unlikely here

  // Function to cancel an appointment
  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    setCancellingId(appointmentId);
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Update the appointment in the local state
        await response.json(); // Process response but don't need to store it
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId ? {...appointment, status: 'CANCELLED'} : appointment
        ));
      } else {
        const error = await response.json();
        setError(`Failed to cancel appointment: ${error.message}`);
      }
    } catch (error) {
      setError('An error occurred while cancelling the appointment');
      console.error('Cancel appointment error:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!patientId) {
    return <div className="text-red-500">Error: Patient profile not found.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">My Appointments</h3>
        <button 
          onClick={() => router.push('/appointments/book')}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
        >
          Book New Appointment
        </button>
      </div>

      {isLoading && <p className="text-gray-600">Loading your appointments...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && appointments.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg mb-4">You have no upcoming appointments.</p>
          <button
            onClick={() => router.push('/appointments/book')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200 ease-in-out mx-auto flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Book Your First Appointment
          </button>
        </div>
      )}

      {!isLoading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-teal-600">
                    Appointment with Dr. {appointment.doctor?.user?.name ?? 'N/A'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Specialization: {appointment.doctor?.specialization ?? 'General Practice'}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Date: {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyles(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              {appointment.reason && <p className="text-gray-500 mt-2">Reason: {appointment.reason}</p>}
              
              {/* Appointment action buttons */}
              <div className="mt-4 flex justify-end">
                {appointment.status === 'SCHEDULED' && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    disabled={cancellingId === appointment.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;