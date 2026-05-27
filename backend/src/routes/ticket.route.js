import express from "express";
import {
  getAllTickets,
  getTicketById,
  createTicket,
  patchTicket,
  approveTicket,
  disapproveTicket,
  checkLowStock,
} from "../controllers/ticket.controller.js";
import authorize from '../middlewares/authorization.middleware.js';
const router = express.Router();
router.use(authorize("admin"));
router.get("/", getAllTickets);

router.post("/check-stock", checkLowStock); 
router.post("/:id/approve", approveTicket);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.patch("/:id", patchTicket);

router.post("/:id/disapprove", disapproveTicket);

export default router;