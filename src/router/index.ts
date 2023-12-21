import express from "express";
import authenticate from "../middleware/authenticate";
import ValidationController from "../controllers/ValidationController";
import UserController from "../controllers/UserController";


const router = express.Router();


// Authentication users
router.post("/register",ValidationController.register);
router.post("/login",ValidationController.login);
router.get("/check",authenticate,ValidationController.check);

router.get('/user', authenticate, UserController.find);



export default router