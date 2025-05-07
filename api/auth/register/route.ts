// c:\Users\Roxx9\Desktop\j2ee\src\app\api\auth\register\route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { email, password, name, role = Role.PATIENT, specialty, dateOfBirth } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Email, password, and name are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as Role,
        ...(role === Role.PATIENT && {
          patientProfile: {
            create: {
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            },
          },
        }),
        ...(role === Role.DOCTOR && specialty && {
          doctorProfile: {
            create: {
              specialty,
            },
          },
        }),
      },
      include: {
        patientProfile: true,
        doctorProfile: true,
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Log the specific error for more insight if it's a Prisma or other known error
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}
