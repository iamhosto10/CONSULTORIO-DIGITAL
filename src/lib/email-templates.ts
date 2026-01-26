export function getAppointmentConfirmationEmail(
  patientName: string,
  date: string,
  doctorName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Cita</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #ffffff;
            padding: 24px;
            border-bottom: 1px solid #e4e4e7;
            text-align: center;
          }
          .content {
            padding: 32px;
            color: #3f3f46;
          }
          .h1 {
            color: #18181b;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
          }
          .details {
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 16px;
            margin: 24px 0;
          }
          .detail-item {
            margin-bottom: 8px;
            font-size: 16px;
          }
          .detail-label {
            font-weight: 600;
            color: #52525b;
          }
          .footer {
            padding: 24px;
            background-color: #fafafa;
            border-top: 1px solid #e4e4e7;
            text-align: center;
            font-size: 14px;
            color: #71717a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; color:#18181b;">Confirmación de Cita</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${patientName}</strong>,</p>
            <p>Tu cita ha sido programada exitosamente.</p>

            <div class="details">
              <div class="detail-item">
                <span class="detail-label">Doctor:</span> Dr. ${doctorName}
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha y Hora:</span> ${date}
              </div>
            </div>

            <p>Si necesitas reagendar o cancelar, por favor contáctanos lo antes posible.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Consultorio Médico. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
