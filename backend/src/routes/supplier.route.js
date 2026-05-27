import express from "express";
import {
  addSupplier,
  deleteSupplier,
  fetchOptimalSupplierList,
  fetchProductsByIds,
  fetchProductsUsingSupplierId,

  fetchSupplierById,
  fetchSuppliers,
  getAllSuppliersTicket,
  getSupplierByIdTicket,
  mapSuppliersWithProduct,
  removeProductFromSuppliers,
  removeSupplierFromProducts,
  updateSupplier,
  updateSupplierRating,
  getPurchaseQuantityBySupplier,
  getAllSuppliersPurchaseFeedback
} from "../controllers/supplier.controller.js";
import { handleSupplierRoute } from "../middlewares/supplier.middleware.js";
import authorize from '../middlewares/authorization.middleware.js';
export const router = express.Router();
router.use(express.json());
router.use(authorize("admin"));
router.get("/ticket", getAllSuppliersTicket);
router.get("/ticket/:id", getSupplierByIdTicket);

router.get("/", handleSupplierRoute, fetchSuppliers);




router.post("/", addSupplier);

router.get("/optimal", fetchOptimalSupplierList);
router.get("/getproductsbysupplierid", fetchProductsUsingSupplierId);
// router.get("/getroducts", fetchProductsByIds);
router.get('/by-supplier',getPurchaseQuantityBySupplier);
// router.get("/purchase-feedback", getSupplierPurchaseWithFeedback);
router.get("/all-purchase-feedback", getAllSuppliersPurchaseFeedback);
router.put("/:supplierid", updateSupplier);
router.delete("/:supplierid", deleteSupplier);
router.get("/:supplierid", fetchSupplierById);
router.patch("/sup_pro_match", mapSuppliersWithProduct);
router.patch("/sup_pro_remove_product", removeProductFromSuppliers);
router.patch("/sup_pro_remove_supplier", removeSupplierFromProducts);
router.patch("/:supplierid/updaterating", updateSupplierRating);


export default router;
