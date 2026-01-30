import { ImageResponse } from 'next/og';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

// Ensure we use Node.js runtime for Mongoose compatibility
export const runtime = 'nodejs';

export const alt = 'Perfil del Doctor';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface Doctor {
  nombre: string;
  especialidad: string;
  fotoUrl?: string;
}

export default async function Image({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  let doctor: Doctor | null = null;

  try {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        await connectDB();
        doctor = await User.findById(userId).select('nombre especialidad fotoUrl').lean<Doctor>();
      }
  } catch (error) {
      console.error('Error fetching doctor for OG image:', error);
  }

  // Fallback values
  const name = doctor?.nombre || 'Consultorio Digital';
  const specialty = doctor?.especialidad || 'Agenda tu cita online';

  const photoUrl = doctor?.fotoUrl;

  // Initials logic
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Avatar */}
          {photoUrl ? (
             <img
                src={photoUrl}
                alt={name}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '4px solid white',
                  marginBottom: 20,
                  objectFit: 'cover',
                }}
             />
          ) : (
             <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: '#dbeafe', // blue-100
                  color: '#2563eb', // blue-600
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 60,
                  fontWeight: 'bold',
                  border: '4px solid white',
                  marginBottom: 20,
                }}
             >
                {initials}
             </div>
          )}

          {/* Name */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 10,
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            {name}
          </div>

          {/* Specialty */}
          <div
            style={{
              fontSize: 30,
              color: '#cbd5e1', // slate-300
              marginBottom: 40,
              textAlign: 'center',
            }}
          >
            {specialty}
          </div>

          {/* Badge */}
          <div
            style={{
              background: '#3b82f6', // blue-500
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              padding: '12px 30px',
              borderRadius: 50,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            📅 Agenda Disponible Online
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
