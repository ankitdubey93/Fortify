🔐 Fortify – Your Secure Password Vault

You must proceed past the browser "Not Secure" warning to access the app.

Fortify is a zero-knowledge, client-side encrypted password manager built with the MERN stack (MongoDB, Express, React, Node.js). Store, organize, and secure your most sensitive credentials with modern cryptography – your secrets remain private, even if the server is compromised.

✨ Features
Zero-knowledge encryption:
Only you can decrypt your data; even the server cannot.

Client-side AES-GCM encryption:
All sensitive info (passwords, PINs, seeds) is AES-GCM encrypted before leaving your device.

Master password stays local:
Never transmitted—cryptographic keys derived in-browser (using PBKDF2 or Argon2id).

Diverse secret types:

Website credentials

ATM PINs (4 & 6 digits)

Internet banking passwords

Wallet passphrases

Crypto wallet seed phrases

Authentication:

Secure, HTTP-only cookie-based session management (JWT access/refresh tokens)

Seamless token refresh for enhanced UX

Protected API routes and CRUD for vault entries

Modern, responsive UI:

Built with React, TypeScript, Tailwind CSS, and ShadCN UI for a clean, fast experience.

Password reset ability:

Reset from "Forgot Password" on the login page (sends a reset link to your email).

Alternatively, reset from "Accounts" while logged in: simply provide your old password and set a new one.

⚡ Tech Stack
Frontend
React + TypeScript

Context API (for authentication and encryption state)

AES-GCM via Web Crypto API

PBKDF2 & Argon2id with argon2-browser

Tailwind CSS & ShadCN UI components

Backend
Node.js + Express + TypeScript

MongoDB (with Mongoose)

Bcrypt for password hashing

JWT (access & refresh tokens)

HTTP-only cookie-based authentication

Robust session management & route protection

🔒 How Zero-Knowledge Encryption Works
Master Password Never Leaves Your Browser:
Used to generate your encryption key locally.

Client-side Encryption:
Sensitive data is AES-GCM encrypted in-browser before transmission.

Unique Salt and Secure Key Derivation:
PBKDF2/Argon2id + per-user salt.

Only Ciphertext on Server:
Database breach? Attackers can’t decrypt a thing without your master password.

🚦 Getting Started
Prerequisites
Node.js (v18+)

MongoDB (local or Atlas/cloud)

Yarn or npm

1. Clone the Repository
bash
git clone https://github.com/your-username/fortify.git
cd fortify
Configure your .env files for backend and frontend as needed.

🔄 New: Automatic GitHub Actions Deployment
The production deployment to AWS Lightsail (https://13.232.184.165) triggers automatically on each main branch push.

Code updates, builds, and Docker Compose restarts are handled by a CI workflow via SSH.

🔐 Account & Password Recovery
Forgot your password? Use the "Forgot Password" link on the login page – enter your email to receive a reset link.

Logged in, want to change your password?
Visit the Accounts page, enter your old password, and set a new one—secure, no email needed.

🛣️ Planned Features
Vault entry export/import (JSON, .kdbx)

Biometric login (WebAuthn)

PWA – Offline vault use

Usage insights & access logs

Browser extension for autofill

Security first, privacy by design. Built for you, not for data harvesters.

Questions? Feature requests? Issues? Open an issue or reach out!
