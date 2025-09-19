import { Router, Response, Request } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { signUp, signIn, verifyEmail, checkUser, refresh, signOut, forgotPassword, resendVerificationEmail, resetPassword } from "../controllers/authController";

const router = Router();
router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/verify-email",verifyEmail);
router.get("/check", authenticateToken, checkUser);
router.post("/signout", signOut);
router.post("/refresh",refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-verification", resendVerificationEmail);

export default router;
