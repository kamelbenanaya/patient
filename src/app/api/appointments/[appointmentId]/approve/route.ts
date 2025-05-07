import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Role, Status } from '@prisma/client';

export async function PATCH(request: NextRequest, { params }: { params: { appointmentId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;

  // Only doctors can approve appointments
  if (user.role !== Role.DOCTOR) {
    return NextResponse.json({ message: 'Forbidden: Only doctors can approve appointments.' }, { status: 403 });
  }

  if (!user.doctorId) {
    return NextResponse.json({ message: 'Doctor profile not found for this user.' }, { status: 400 });
  }

  const { appointmentId } = params;
  if (!appointmentId) {
    return NextResponse.json({ message: 'Appointment ID is required.' }, { status: 400 });
  }

  try {
    // First, check if the appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, status: true }
    });

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found.' }, { status: 404 });
    }

    if (appointment.doctorId !== user.doctorId) {
      return NextResponse.json({ message: 'Forbidden: You can only approve your own appointments.' }, { status: 403 });
    }

    if (appointment.status !== Status.PENDING) {
      return NextResponse.json({ message: 'Only pending appointments can be approved.' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // action can be 'approve' or 'reject'

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ message: 'Invalid action. Must be either "approve" or "reject".' }, { status: 400 });
    }

    // Update the appointment status based on the action
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: action === 'approve' ? Status.APPROVED : Status.REJECTED,
      },
      select: {
        id: true,
        date: true,
        time: true,
        status: true,
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json({ message: 'Failed to update appointment status.' }, { status: 500 });
  }
}