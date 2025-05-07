// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ensure this path is correct
import { prisma } from '@/lib/prisma'; // Your Prisma client instance
import { Status, Role } from '@prisma/client'; // Changed AppointmentStatus to Status

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;

  try {
    let appointments;

    if (user.role === Role.PATIENT) { // Using imported Role for comparison
      if (!user.patientId) {
        return NextResponse.json({ message: 'Patient ID not found for this user.' }, { status: 400 });
      }
      appointments = await prisma.appointment.findMany({
        where: { patientId: user.patientId },
        select: {
          id: true,
          date: true,
          time: true,
          duration: true,
          status: true,
          notes: true,
          doctor: {
            select: {
              id: true,
              specialty: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc',
        },
      });
    } else if (user.role === Role.DOCTOR) { // Using imported Role for comparison
      if (!user.doctorId) {
        return NextResponse.json({ message: 'Doctor ID not found for this user.' }, { status: 400 });
      }
      appointments = await prisma.appointment.findMany({
        where: { doctorId: user.doctorId },
        select: {
          id: true,
          date: true,
          time: true,
          duration: true,
          status: true,
          notes: true,
          patient: {
            select: { 
              id: true,
              user: { 
                select: { 
                  name: true 
                } 
              } 
            }
          }
        },
        orderBy: {
          date: 'asc',
        },
      });
    } else {
      // For ADMIN or other roles, currently not returning appointments via this specific logic
      return NextResponse.json({ message: 'Access denied for this role or role not supported for appointments view.' }, { status: 403 });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ message: 'Internal Server Error: Could not fetch appointments.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;

  // Only patients can create appointments
  if (user.role !== Role.PATIENT) {
    return NextResponse.json({ message: 'Forbidden: Only patients can create appointments.' }, { status: 403 });
  }

  if (!user.patientId) {
    return NextResponse.json({ message: 'Patient profile not found for this user.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { doctorId, date, time, duration, notes } = body;

    // Basic validation
    if (!doctorId || !date || !time) {
      return NextResponse.json({ message: 'Missing required fields: doctorId, date, and time are required.' }, { status: 400 });
    }

    // Further validation (e.g., check if doctorId exists, date is valid and in the future) can be added here
    // For simplicity, we'll assume valid inputs for now.

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: user.patientId,
        doctorId: doctorId,
        date: new Date(date), // Ensure this is a valid ISO date string from client
        time: time,
        duration: duration ?? 30, // Default to 30 minutes if not specified
        status: Status.PENDING, // Initial status is PENDING, requiring doctor approval
        notes: notes ?? null, // Optional notes
      },
      select: { // Select details for the response
        id: true,
        date: true,
        time: true,
        duration: true,
        status: true,
        notes: true,
        doctor: {
          select: {
            id: true,
            specialty: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        patient: {
          select: { 
            id: true,
            user: { 
              select: { 
                name: true 
              } 
            } 
          }
        }
      }
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create appointment:', error);
    if (error.code === 'P2003') { // Prisma foreign key constraint failed (e.g. doctorId doesn't exist)
        return NextResponse.json({ message: 'Invalid doctorId or other relational constraint failed.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Could not create appointment.' }, { status: 500 });
  }
}