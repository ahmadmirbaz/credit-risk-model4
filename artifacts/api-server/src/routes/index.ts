import { Router, type IRouter } from "express";
import healthRouter from "./health";
import creditRiskRouter from "./creditRisk";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/credit-risk", creditRiskRouter);
router.use("/openai", openaiRouter);

export default router;
