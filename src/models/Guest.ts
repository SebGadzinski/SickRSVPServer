/**
 * @file Defines a schema for the user collection.
 * @author Sebastian Gadzinski
 */
import mongoose, { Document, Model, Schema } from 'mongoose';
import { transform } from '../utils/transform';

export interface IGuest extends Document {
  _id: Schema.Types.ObjectId;
  email: string;
  emailSent: boolean;
  name: string;
  guests: number;
}

interface IGuestModel extends Model<IGuest> {
  // Add any static methods here if needed
}

const GuestSchema: Schema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    emailSent: { type: Boolean, required: true, default: false },
    name: { type: String, required: true },
    guests: { type: Number, required: true }
  },
  {
    timestamps: true,
    toJSON: { transform }
  }
);

const Guest: IGuestModel = mongoose.model<IGuest, IGuestModel>('guest', GuestSchema);
export default Guest;
