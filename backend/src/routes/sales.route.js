import express from "express";
import {
  getAllSales,
  createSale,
  getSalesFormData,
} from "../controllers/sales.controller.js";
import authorize from '../middlewares/authorization.middleware.js';
const router = express.Router();
router.use(authorize("admin", "staff"));
router.get("/", getAllSales);
// router.get("/sales-form-data", getSalesFormData);
router.post("/", createSale);

export default router;