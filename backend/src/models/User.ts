import mongoose, { Document, mongo, Schema, Types } from "mongoose";

export interface Entry extends mongoose.Types.Subdocument {
  _id: mongoose.Types.ObjectId;
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
  encryptionSalt?: string;
  keyDerivationMethod?: "argon2id" | "pbkdf2";
  data: Types.DocumentArray<Entry>;
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
  encryptionSalt: { type: String },
  keyDerivationMethod: { type: String, enum: ["argon2id", "pbkdf2"] },
  data: [entrySchema],
});

export const User = mongoose.model<User>("User", userSchema);
