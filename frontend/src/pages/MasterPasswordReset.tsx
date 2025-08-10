

import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEncryptionSalt } from '../services/dashServices';
import { base64ToBuffer, bufferToBase64, createHMAC, decryptData, encryptData, generateSalt } from '../utils/cryptoUtils';
import { getEncryptedVault } from '../services/vaultservices';
import { deriveKey } from '../utils/deriveKey';



const MasterPasswordReset: React.FC = () => {

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [method, setMethod] = useState<"pbkdf2" | "argon2id">("pbkdf2");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const {setIsLoggedIn, setUser} = useAuth();

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if(newPassword !== confirmNewPassword) {
            setError("New master passwords do not match.")
            return;
        }

        try {
            const response = await getEncryptionSalt();
            const {encryptionSalt, keyDerivationMethod, verification} = response;

            if(!encryptionSalt || !keyDerivationMethod || !verification) {
                 new Error("Missing required encryption data from server.");
            }

            const {aesKey: oldAesKey, hmacKey: oldHmacKey} = await deriveKey(oldPassword,base64ToBuffer(encryptionSalt), keyDerivationMethod );

            const hmacToVerify = await createHMAC(oldHmacKey, verification.secret);

            if(hmacToVerify !== verification.hmac) {
                throw new Error("Old master password verification failed.")
            } 

            const encryptedVault = await getEncryptedVault();

            const decryptedEntries = await Promise.all(encryptedVault.data.map(async(entry: any) => {
                const decryptedWebsite = await decryptData(entry.website.cipherText, entry.website.iv, oldAesKey);
                const decryptedUsername = await decryptData(entry.username.cipherText, entry.username.iv, oldAesKey);
                const decryptedPassword = await decryptData(entry.password.cipherText, entry.password.iv, oldAesKey);
                const decryptedNotes = entry.notes ? await decryptData(entry.notes.cipherText, entry.notes.iv, oldAesKey) : "";
                return {...entry, decryptedWebsite, decryptedUsername, decryptedPassword, decryptedNotes};
            }));

            const newSalt = generateSalt();
            const {aesKey: newAesKey, hmacKey: newHmacKey} = await deriveKey(newPassword, newSalt, method);

             const reEncryptedEntries = await Promise.all(decryptedEntries.map(async (entry: any) => ({
        _id: entry._id,
        website: await encryptData(entry.decryptedWebsite, newAesKey),
        username: await encryptData(entry.decryptedUsername, newAesKey),
        password: await encryptData(entry.decryptedPassword, newAesKey),
        notes: entry.decryptedNotes ? await encryptData(entry.decryptedNotes, newAesKey) : null,
      })));

      // 7. Create new verification HMAC and secret
      const newVerificationText = crypto.randomUUID();
      const newHmac = await createHMAC(newHmacKey, newVerificationText);

      // 8. Send updated master password data and re-encrypted entries to server
      await sendMasterPasswordReset(
        bufferToBase64(newSalt),
        method,
        { secret: newVerificationText, hmac: newHmac },
        reEncryptedEntries
      );

      // Optional: log the user out or update auth state
      setSuccess("Master password reset successfully.");
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login", { replace: true });
   
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='min-h-screen bg-sky-100 flex text-center items-center justify-center '>
            <form onSubmit={handleSubmit} className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4' >
            <h1 className="text-4xl font-bold text-sky-800 mb-4">Reset Master Password</h1>
                <input 
                type="password"
                placeholder='Old Master Password'
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required 
                className='w-full border p-2 rounded'
                />
                <input 
                type="password"
                placeholder='New Master Password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required 
                className='w-full border p-2 rounded'
                />
                <input 
                type="password"
                placeholder='Confirm New Master Password'
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                required 
                className='w-full border p-2 rounded'
                />
                <select
                value={method}
                onChange={e => setMethod(e.target.value as "pbkdf2" | "argon2id")}
                className='w-full border p-2 rounded'
                >
                    <option>PBKDF2</option>
                    <option>Argon2id</option>
                </select>
                {error && <p className="text-red-600 font-semibold">{error}</p>}
        {success && <p className="text-green-600 font-semibold">{success}</p>}
                <button className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800">
                    Reset Password
                </button>
            </form>
        </div>
    )
}



export default MasterPasswordReset;