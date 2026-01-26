import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClinicalRecord {
  _id?: string;
  fecha: Date;
  nota: string;
  diagnostico?: string;
}

export interface IPatient extends Document {
  professionalId: mongoose.Types.ObjectId;
  cedula: string;
  nombre: string;
  telefono?: string;
  email?: string;
  historiaClinica: IClinicalRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const ClinicalRecordSchema = new Schema<IClinicalRecord>({
  fecha: {
    type: Date,
    default: Date.now,
  },
  nota: {
    type: String,
    required: [true, 'La nota es requerida'],
  },
  diagnostico: {
    type: String,
  },
});

const PatientSchema = new Schema<IPatient>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del profesional es requerido'],
      index: true,
    },
    cedula: {
      type: String,
      required: [true, 'La cédula es requerida'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
    },
    telefono: {
      type: String,
    },
    email: {
      type: String,
    },
    historiaClinica: [ClinicalRecordSchema],
  },
  {
    timestamps: true,
  }
);

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
