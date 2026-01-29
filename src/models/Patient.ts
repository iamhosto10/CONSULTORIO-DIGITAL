import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClinicalRecord {
  _id?: string;
  fecha: Date;
  nota: string;
  diagnostico?: string;
}

export interface IPatientFile {
  nombre: string;
  url: string;
  tipo: string;
  fecha: Date;
}

export interface IPatient extends Document {
  professionalId: mongoose.Types.ObjectId;
  cedula: string;
  nombre: string;
  telefono?: string;
  email?: string;
  historiaClinica: IClinicalRecord[];
  archivos: IPatientFile[];
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

const PatientFileSchema = new Schema<IPatientFile>({
  nombre: { type: String, required: true },
  url: { type: String, required: true },
  tipo: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
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
    archivos: [PatientFileSchema],
  },
  {
    timestamps: true,
  }
);

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
