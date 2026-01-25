import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  especialidad: {
    type: String,
    default: '',
  },
  registroMedico: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
