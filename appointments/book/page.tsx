// src/app/appointments/book/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // For redirection

interface Doctor {
  id: string;
  name: string | null;
  specialization: string | null;
}

const BookAppointmentPage = () => {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(''); // Store as YYYY-MM-DD
  const [appointmentTime, setAppointmentTime] = useState<string>(''); // Store as HH:MM
  const [reason, setReason] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data: Doctor[] = await response.json();
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0].id); // Default to first doctor
        }
      } catch (err: any) {
        setError(err.message ?? 'Could not load doctors.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Please select a doctor, date, and time.');
      setIsLoading(false);
      return;
    }

    // Combine date and time into an ISO string
    // Note: This assumes the user's local timezone. For production, timezone handling might need to be more robust.
    const dateTimeString = `${appointmentDate}T${appointmentTime}:00`;
    const isoAppointmentDate = new Date(dateTimeString).toISOString();

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          appointmentDate: isoAppointmentDate,
          reason: reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? 'Failed to book appointment.');
      }

      const newAppointment = await response.json();
      setSuccessMessage(`Appointment booked successfully with ${newAppointment.doctor.user.name} on ${new Date(newAppointment.appointmentDate).toLocaleDateString()}!`);
      // Optionally, redirect after a delay or clear form
      setTimeout(() => {
        router.push('/dashboard'); // Redirect to dashboard
      }, 3000);

    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="mb-6 text-teal-600 hover:text-teal-800 transition-colors"
      >
        &larr; Go Back
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Book a New Appointment</h1>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Success!</p>
          <p>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6">
        <div>
          <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
            Select Doctor
          </label>
          <select
            id="doctor"
            name="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
            disabled={isLoading || doctors.length === 0}
          >
            {doctors.length === 0 && <option>Loading doctors...</option>}
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} ({doc.specialization ?? 'General'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="appointmentDate"
            name="appointmentDate"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            id="appointmentTime"
            name="appointmentTime"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Appointment (Optional)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
            disabled={isLoading || !selectedDoctor || !appointmentDate || !appointmentTime}
          >
            {isLoading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentPage;