import express from "express";
import { initiatePayment, simulateWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/confirmPayment", simulateWebhook);

export default router;
