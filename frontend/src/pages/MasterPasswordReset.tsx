import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEncryptionSalt, restoreVault, sendMasterPasswordReset } from '../services/dashServices';
import { base64ToBuffer, bufferToBase64, createHMAC, decryptData, encryptData, generateSalt } from '../utils/cryptoUtils';
import { getEncryptedVault } from '../services/vaultservices';
import { deriveKey } from '../utils/deriveKey';
import { signout } from '../services/authServices';

type VaultBackupData = {
    entries: any[];
    verification: {
        secret: string;
        hmac: string;
    };
};

const MasterPasswordReset: React.FC = () => {

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [method, setMethod] = useState<"pbkdf2" | "argon2id">("pbkdf2");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false); // optional, for UX
     const [vaultBackup, setVaultBackup] = useState<VaultBackupData | null>(null);


    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (newPassword !== confirmNewPassword) {
            setError("New master passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await getEncryptionSalt();
            const { encryptionSalt, keyDerivationMethod, verification } = response;

            if (!encryptionSalt || !keyDerivationMethod || !verification) {
                throw new Error("Missing required encryption data from server.");
            }

            const { aesKey: oldAesKey, hmacKey: oldHmacKey } = await deriveKey(oldPassword, base64ToBuffer(encryptionSalt), keyDerivationMethod);
            const hmacToVerify = await createHMAC(oldHmacKey, verification.secret);

            if (hmacToVerify !== verification.hmac) {
                throw new Error("Old master password verification failed.");
            }


    

            const encryptedVault = await getEncryptedVault();
            setVaultBackup({
                entries: encryptedVault.data,
                verification: { secret: verification.secret, hmac: verification.hmac },
            });

            const decryptedEntries = await Promise.all(encryptedVault.data.map(async (entry: any) => {
                const decryptedWebsite = await decryptData(entry.website.cipherText, entry.website.iv, oldAesKey);
                const decryptedUsername = await decryptData(entry.username.cipherText, entry.username.iv, oldAesKey);
                const decryptedPassword = await decryptData(entry.password.cipherText, entry.password.iv, oldAesKey);
                const decryptedNotes = entry.notes ? await decryptData(entry.notes.cipherText, entry.notes.iv, oldAesKey) : "";
                return { ...entry, decryptedWebsite, decryptedUsername, decryptedPassword, decryptedNotes };
            }));

            const newSalt = generateSalt();
            const { aesKey: newAesKey, hmacKey: newHmacKey } = await deriveKey(newPassword, newSalt, method);

            const reEncryptedEntries = await Promise.all(decryptedEntries.map(async (entry: any) => ({
                _id: entry._id,
                website: await encryptData(entry.decryptedWebsite, newAesKey),
                username: await encryptData(entry.decryptedUsername, newAesKey),
                password: await encryptData(entry.decryptedPassword, newAesKey),
                notes: entry.decryptedNotes ? await encryptData(entry.decryptedNotes, newAesKey) : null,
            })));

            const newVerificationText = crypto.randomUUID();
            const newHmac = await createHMAC(newHmacKey, newVerificationText);

            await sendMasterPasswordReset(
                bufferToBase64(newSalt),
                method,
                { secret: newVerificationText, hmac: newHmac },
                reEncryptedEntries
            );


            setSuccess("Master password reset successfully. You will be logged out.");
            setTimeout(() => {
                logout();
                signout();
                navigate("/", { replace: true });
            }, 1500); // Wait 1.5s so the user sees the message
        }
        catch (error: any) {
            setError(error?.message || "An unexpected error occurred.");
            if(vaultBackup) {
                try {
                    await restoreVault(vaultBackup);
                    console.log("Vault + verification restored successfully from backup.")
                } catch (restoreErr) {
                    console.error("Vault restore failed:", restoreErr);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sky-100 flex text-center items-center justify-center">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 space-y-4">
                    <h1 className="text-4xl font-bold text-sky-800 mb-4">Reset Master Password</h1>
                    <input
                        type="password"
                        placeholder="Old Master Password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        required
                        className="w-full border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="New Master Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        className="w-full border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Master Password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full border p-2 rounded"
                    />
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value as "pbkdf2" | "argon2id")}
                        className="w-full border p-2 rounded"
                    >
                        <option>PBKDF2</option>
                        <option>argon2id</option>
                    </select>
                    <button
                        className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                {/* Error/success messages below the form */}
                <div style={{ minHeight: "2.5em" }} className="mt-2">
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                    {success && <p className="text-green-600 font-semibold">{success}</p>}
                </div>
                </form>
                {/* Password method info box */}
                <div className="mt-6 bg-sky-50 border border-sky-200 rounded p-4 text-left text-gray-700">
                    <div className="font-semibold mb-1">Password Derivation Methods</div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>
                            <strong>PBKDF2</strong> is a widely-used and well-tested standard that slows down brute-force attacks by applying many rounds of hashing.
                        </li>
                        <li>
                            <strong>Argon2id</strong> is a modern algorithm that requires both time and memory to compute, making it much harder for attackers using powerful hardware (like GPUs or ASICs) to crack passwords.
                        </li>
                        <li>
                            Both are secure, but <strong>Argon2id</strong> offers stronger protection against modern hardware attacks and is recommended when supported.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MasterPasswordReset;
