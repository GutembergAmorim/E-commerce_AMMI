import express from "express";
import { subscribe, unsubscribe } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/", subscribe);
router.delete("/:email", unsubscribe);

export default router;
