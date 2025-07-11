import mongoose, { Document, mongo, Schema, Types } from "mongoose";

interface EncryptedField {
  cipherText: string;
  iv: string;
}

export interface Entry extends mongoose.Types.Subdocument {
  _id: mongoose.Types.ObjectId;
  website: EncryptedField;
  username: EncryptedField;
  password: EncryptedField;
  notes?: EncryptedField;
}

export interface User extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  encryptionSalt?: string;
  keyDerivationMethod?: "argon2id" | "pbkdf2";
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetTokenExpires: Date | null;
  data: Types.DocumentArray<Entry>;
  verification: {
    secret: string;
    hmac: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const encryptedFieldSchema = new Schema(
  {
    cipherText: { type: String, required: true },
    iv: { type: String, required: true },
  },
  { _id: false }
);

const entrySchema = new Schema<Entry>(
  {
    website: encryptedFieldSchema,
    username: encryptedFieldSchema,
    password: encryptedFieldSchema,
    notes: encryptedFieldSchema,
  },
  { _id: true }
);

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    encryptionSalt: { type: String },
    keyDerivationMethod: { type: String, enum: ["argon2id", "pbkdf2"] },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationTokenExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetTokenExpires: { type: Date, default: null },
    data: [entrySchema],
    verification: {
      secret: { type: String, default: null },
      hmac: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<User>("User", userSchema);
