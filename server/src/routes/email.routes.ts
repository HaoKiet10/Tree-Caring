import { Router } from "express";
import * as emailController from "../controller/email.controller";
const router = Router();
router.post("/", emailController.sendReport);
export default router;
