import { Router } from 'express';
import { 
    registerUser, 
    verifyEmail,
    resendVerificationEmail,
    forgotPasswordRequest,
    resetForgottenPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changePassword,
    updateUserDetails,
    updateUserAvatar,
    deleteUserAccount 
} from '../controllers/user.controller';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(upload.single("avatar"),registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/resend-email-verification").post(resendVerificationEmail);