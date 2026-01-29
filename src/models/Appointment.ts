import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AppointmentStatus {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

export interface IAppointment extends Document {
  professionalId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  costo: number;
  estado: AppointmentStatus;
  notas?: string;
  payment: {
    status: 'pendiente' | 'pagado';
    amount: number;
    method: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
    date?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del profesional es obligatorio'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'El ID del paciente es obligatorio'],
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    fechaFin: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria'],
    },
    costo: {
      type: Number,
      required: [true, 'El costo es obligatorio'],
      min: [0, 'El costo no puede ser negativo'],
    },
    estado: {
      type: String,
      enum: {
        values: Object.values(AppointmentStatus),
        message: '{VALUE} no es un estado válido',
      },
      default: AppointmentStatus.PENDIENTE,
      required: [true, 'El estado es obligatorio'],
    },
    notas: {
      type: String,
      required: false,
    },
    payment: {
      status: {
        type: String,
        enum: ['pendiente', 'pagado'],
        default: 'pendiente',
      },
      amount: { type: Number, default: 0 },
      method: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
        default: 'efectivo',
      },
      date: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Índices
AppointmentSchema.index({ professionalId: 1, fechaInicio: 1 });

// Validaciones
AppointmentSchema.pre('validate', function () {
  if (this.fechaInicio && this.fechaFin && this.fechaInicio >= this.fechaFin) {
    this.invalidate('fechaFin', 'La fecha de fin debe ser posterior a la fecha de inicio.');
  }
});

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
