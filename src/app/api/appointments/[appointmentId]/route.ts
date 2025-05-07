// src/app/api/appointments/[appointmentId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';

// PATCH handler to update appointment status (e.g., cancel)
export async function PATCH(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;
  const { appointmentId } = params;

  if (!appointmentId) {
    return NextResponse.json({ message: 'Appointment ID is required.' }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found.' }, { status: 404 });
    }

    // Authorization: Only the patient who booked or an admin can cancel.
    const isPatientOwner = user.role === Role.PATIENT && appointment.patientId === user.patientId;

    if (!isPatientOwner) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to modify this appointment.' }, { status: 403 });
    }
    
    if (appointment.status === Status.COMPLETED || appointment.status === Status.CANCELLED) {
        return NextResponse.json({ message: `Appointment is already ${appointment.status.toLowerCase()}.` }, { status: 400 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: Status.CANCELLED,
      },
      include: { 
        doctor: { 
          include: {
            user: true
          }
        },
        patient: { 
          include: {
            user: true
          }
        },
      }
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error(`Failed to update appointment ${appointmentId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Could not update appointment.' }, { status: 500 });
  }
}