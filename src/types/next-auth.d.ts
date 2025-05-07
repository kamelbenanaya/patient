// c:\Users\Roxx9\Desktop\j2ee\src\types\next-auth.d.ts
import { Role } from '@prisma/client'; // Make sure Role is correctly imported/defined
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role; // Matches the role type from your Prisma schema
      patientId?: string | null; // Allow null if that's possible from your logic
      doctorId?: string | null;  // Allow null if that's possible from your logic
    } & DefaultSession['user']; // This merges with the default user properties
  }

  // Extends the User object you return from the authorize callback
  interface User extends DefaultUser {
    id: string; // Ensure id is part of the User interface if not already
    role: Role;
    patientId?: string | null;
    doctorId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  // Extends the JWT token
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    patientId?: string | null;
    doctorId?: string | null;
  }
}
