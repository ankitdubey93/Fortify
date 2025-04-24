import mongoose, { Document, Schema } from "mongoose";

export interface Entry {
  website: string;
  username: string;
  password: string;
  notes?: string;
}

export interface User extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  password: string;
  data: Entry[];
}

const entrySchema = new Schema<Entry>(
  {
    website: String,
    username: String,
    password: String,
    notes: String,
  },
  { _id: true }
);

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  data: [entrySchema],
});

export const User = mongoose.model<User>("User", userSchema);
