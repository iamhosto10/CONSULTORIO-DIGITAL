'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Patient from '@/models/Patient';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getPresignedUrl(fileType: string, fileSize: number) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const ext = fileType.split('/')[1];
  const uuid = crypto.randomUUID();
  const key = `pacientes/${uuid}-${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return {
    uploadUrl,
    key,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION
  };
}

export async function saveFileReference(
  patientId: string,
  fileData: { nombre: string; url: string; tipo: string }
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  await connectDB();

  await Patient.findOneAndUpdate(
    { _id: patientId, professionalId: session.user.id },
    {
      $push: {
        archivos: {
          nombre: fileData.nombre,
          url: fileData.url,
          tipo: fileData.tipo,
          fecha: new Date(),
        },
      },
    }
  );

  revalidatePath(`/dashboard/pacientes/${patientId}`);
  return { success: true };
}
