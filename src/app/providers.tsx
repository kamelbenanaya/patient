// c:\Users\Roxx9\Desktop\j2ee\src\app\providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}
