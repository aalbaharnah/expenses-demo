import * as express from "express";
import transactions from "./transactions";

const router = express.Router();

router.use("/transactions", transactions);

export default router;