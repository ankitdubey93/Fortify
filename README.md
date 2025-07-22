# 🔐 Fortify – Your Secure Password Vault

Fortify is a zero-knowledge, client-side encrypted password manager built using the MERN stack (MongoDB, Express, React, Node.js). It allows you to securely store and manage sensitive information — including login credentials, ATM PINs, banking passwords, and crypto wallet seeds — with strong cryptography and modern authentication.

---

##  Features

-  Zero-knowledge encryption: only you can decrypt your data
-  Client-side AES-GCM encryption using master password
-  Master password never leaves your device
-  PBKDF2 or Argon2id for secure key derivation
-  Store multiple types of secrets:
  - Website credentials
  - ATM PINs (4 & 6 digits)
  - Internet banking passwords
  - Wallet passphrases
  - Crypto wallet seed phrases
-  Sign up → Set master password flow
-  HTTP-only cookies for secure access/refresh token auth
-  Seamless auto-refresh token system
-  Protected routes with full CRUD for vault entries
-  Clean UI with Tailwind CSS and ShadCN UI
-  Responsive React + TypeScript frontend

---

##  Tech Stack

### Frontend
- React + TypeScript
- Context API for auth and encryption key state
- AES-GCM via Web Crypto API
- PBKDF2 and Argon2id with `argon2-browser`
- Tailwind CSS + ShadCN UI components

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- Bcrypt for password hashing
- JWTs for access/refresh tokens
- HTTP-only cookie-based auth
- Secure route protection and session handling

---

## 🔐 Zero-Knowledge Encryption

Fortify is built with **zero-knowledge principles**, meaning **even the server cannot access your encrypted data**.

### How it works:
- Your **master password is never sent to the server**.
- It is used **in the browser** to derive an encryption key (via **PBKDF2** or **Argon2id**) along with a unique salt.
- All sensitive data is encrypted **client-side using AES-GCM** before being sent to the server.
- The server only stores **ciphertext**, never raw data or passwords.
- Even if your database is breached, **no one can decrypt your data without your master password**.

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Yarn or npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fortify.git
cd fortify


🛠 Planned Features
Entry export/import (JSON, .kdbx)
Biometric login with WebAuthn
Progressive Web App (PWA) support
Vault usage insights and logs
Browser Integration
