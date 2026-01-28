import mongoose, { Schema, Document } from "mongoose";

export interface IDayAvailability {
  active: boolean;
  start: string;
  end: string;
}

export interface IAvailability {
  monday: IDayAvailability;
  tuesday: IDayAvailability;
  wednesday: IDayAvailability;
  thursday: IDayAvailability;
  friday: IDayAvailability;
  saturday: IDayAvailability;
  sunday: IDayAvailability;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  nombre: string;
  especialidad: string;
  registroMedico: string;
  availability: IAvailability;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingrese un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      select: false,
    },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
    },
    especialidad: {
      type: String,
      required: [true, "La especialidad es obligatoria"],
    },
    registroMedico: {
      type: String,
      required: [true, "El registro médico es obligatorio"],
    },
    availability: {
      monday: {
        active: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:00" },
      },
      tuesday: {
        active: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:00" },
      },
      wednesday: {
        active: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:00" },
      },
      thursday: {
        active: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:00" },
      },
      friday: {
        active: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:00" },
      },
      saturday: {
        active: { type: Boolean, default: false },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "12:00" },
      },
      sunday: {
        active: { type: Boolean, default: false },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "12:00" },
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
