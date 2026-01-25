import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  nombre: string;
  especialidad: string;
  registroMedico: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
    },
    registroMedico: {
      type: String,
      required: [true, 'El registro médico es obligatorio'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
