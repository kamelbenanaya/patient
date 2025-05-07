// src/app/api/doctors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { Role } from '@prisma/client'; 

// Interface for the raw result from Prisma, assuming 'specialty' field
interface PrismaDoctorResult {
  name: string | null;
  doctorProfile: {
    id: string;
    specialty: string | null; // Assuming the field is 'specialty' in the Doctor model
  } | null;
}

// Interface for the final formatted doctor object for the API response
interface FormattedDoctor {
  id: string;
  name: string | null;
  specialization: string | null; // API will consistently return 'specialization'
}

export async function GET() {
  try {
    // Cast the result of findMany to PrismaDoctorResult[]
    // Prisma's select should ensure this shape if 'specialty' is the correct field name
    const doctorsFromDb = await prisma.user.findMany({
      where: {
        role: Role.DOCTOR,
        doctorProfile: { 
          isNot: null
        }
      },
      select: {
        name: true,
        doctorProfile: {
          select: {
            id: true, 
            specialty: true, // Query for 'specialty'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }) as PrismaDoctorResult[]; // Explicit cast, assuming the select matches PrismaDoctorResult

    const formattedDoctors: FormattedDoctor[] = doctorsFromDb
      .map((doc: PrismaDoctorResult): FormattedDoctor | null => {
        if (!doc.doctorProfile) {
          // This should ideally not be hit due to the where clause, but good for type safety
          return null; 
        }
        return {
          id: doc.doctorProfile.id, 
          name: doc.name,
          specialization: doc.doctorProfile.specialty, // Map 'specialty' from DB to 'specialization' for API response
        };
      })
      .filter((doc): doc is FormattedDoctor => doc !== null); // Type guard ensures we only have FormattedDoctor objects

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    // It's good practice to avoid sending raw error messages to the client in production
    return NextResponse.json({ message: 'Internal Server Error: Could not fetch doctors.' }, { status: 500 });
  }
}