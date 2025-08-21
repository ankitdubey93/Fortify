import {Request, Response, NextFunction} from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';


export const setMasterPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;
        console.log(userId);
        const { encryptionSalt, keyDerivationMethod, verification } = req.body;
    
        if (!encryptionSalt || !keyDerivationMethod || !verification) {
          res.status(400).json({ error: "Missing required fields." });
          return;
        }
    
        try {
          const user = await User.findById(userId);
          if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
          }
    
          if (user.encryptionSalt) {
            res.status(400).json({ error: "Master password already set." });
            return;
          }
    
          user.encryptionSalt = encryptionSalt;
          user.keyDerivationMethod = keyDerivationMethod;
          user.verification = verification;
    
          await user.save();
          res.status(200).json({ message: "Encryption parameters saved." });
          return;
        } catch (error) {
          console.error("Error setting master password info:", error);
          res.status(500).json({ error: "Internal Server error" });
          return;
        }
      };

