'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Image as ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import { getPresignedUrl, saveFileReference } from '@/actions/file-actions';
import { toast } from 'sonner';
import type { IPatientFile } from '@/models/Patient';

interface PatientFileManagerProps {
  patientId: string;
  files: IPatientFile[];
}

export default function PatientFileManager({ patientId, files = [] }: PatientFileManagerProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting same file again if needed
    e.target.value = '';

    setUploading(true);
    try {
      // 1. Get presigned URL
      const { uploadUrl, key, bucketName, region } = await getPresignedUrl(file.type, file.size);

      // 2. Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Error al subir el archivo a S3');
      }

      // 3. Construct Final URL
      let finalUrl = '';
      // Default to standard s3 url format
      if (region === 'us-east-1' || !region) {
          finalUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
      } else {
          finalUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      }

      // 4. Save Reference
      await saveFileReference(patientId, {
        nombre: file.name,
        url: finalUrl,
        tipo: file.type.startsWith('image/') ? 'imagen' : 'pdf',
      });

      toast.success('Archivo adjuntado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
        {/* Header/Upload Section */}
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Documentos Adjuntos</h3>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Paperclip className="h-4 w-4 mr-2" />}
                    {uploading ? 'Subiendo...' : 'Adjuntar Archivo'}
                </Button>
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                />
            </div>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(!files || files.length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    No hay documentos adjuntos
                </div>
            )}
            {(files || []).map((file, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow group relative" onClick={() => openFile(file.url)}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                        {file.tipo === 'imagen' || file.url.match(/\.(jpeg|jpg|png|webp)$/i) ? (
                            <ImageIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                        ) : (
                            <FileText className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
                        )}
                        <p className="text-xs font-medium truncate w-full text-gray-700" title={file.nombre}>
                            {file.nombre}
                        </p>
                        <p className="text-[10px] text-gray-400">
                           {file.fecha ? new Date(file.fecha).toLocaleDateString() : ''}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
