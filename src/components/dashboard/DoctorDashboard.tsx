// src/components/dashboard/DoctorDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';

// Define the shape of an Appointment object for Doctor's view
interface Appointment {
  id: string;
  appointmentDate: string; // or Date
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  doctorId: string;
  patientId: string;
  status: string; // e.g., 'PENDING', 'APPROVED', 'REJECTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'
  reason: string | null;
  notes: string | null;
  createdAt: string; // or Date
  updatedAt: string; // or Date
  patient: { // Nested patient information
    user: {
      name: string | null;
      email: string | null;
    }
  } | null; // Patient might be null if not included
}

interface DoctorDashboardProps {
  doctorId: string;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctorId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    if (doctorId) { // Ensure doctorId is present before fetching
        fetchAppointments();
    } else {
        setError("Doctor ID not found. Cannot fetch appointments.");
        setIsLoading(false);
    }
  }, [doctorId]);

  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'SCHEDULED': return 'bg-teal-100 text-teal-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'reject') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? `Failed to ${action} appointment`);
      }

      // Update the local state to reflect the change
      const updatedAppointment = await response.json();
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: updatedAppointment.status } : apt
      ));

    } catch (err: any) {
      setError(err.message ?? `An error occurred while ${action}ing the appointment`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!doctorId) { // Added check for doctorId, similar to PatientDashboard
    return <div className="text-red-500">Error: Doctor profile not found.</div>;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">Your Scheduled Appointments</h3>
      
      {isLoading && <p className="text-gray-600">Loading your appointments...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && appointments.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">You have no appointments scheduled.</p>
        </div>
      )}

      {!isLoading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-teal-600">
                    Appointment with {appointment.patient?.user?.name ?? 'N/A'}
                  </h4>
                  <p className="text-gray-600">
                    Date: {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyles(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              {appointment.reason && <p className="text-gray-500 mt-2">Reason: {appointment.reason}</p>}
              <div className="mt-4 text-right">
                {appointment.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md mr-2 text-sm transition-colors"
                      disabled={isLoading}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      disabled={isLoading}
                    >
                      Reject
                    </button>
                  </>
                )}
                {appointment.status !== 'PENDING' && (
                  <button className="text-teal-500 hover:underline mr-3 text-sm">View Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;