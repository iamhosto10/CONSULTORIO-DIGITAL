'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { getMonthlyReportData } from '@/actions/report-actions';
import * as xlsx from 'xlsx';
import { toast } from 'sonner';

export default function DownloadReportButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      toast.info('Generando reporte...');

      const data = await getMonthlyReportData(month, year);

      if (!data || data.length === 0) {
        toast.warning('No hay pagos registrados para este mes.');
        return;
      }

      // Generate Excel
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Reporte");

      const fileName = `Reporte_Financiero_${year}_${(month + 1).toString().padStart(2, '0')}.xlsx`;
      xlsx.writeFile(wb, fileName);

      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={loading}
      className="gap-2"
    >
      <FileSpreadsheet className="h-4 w-4" />
      {loading ? 'Generando...' : 'Descargar Reporte Excel'}
    </Button>
  );
}
