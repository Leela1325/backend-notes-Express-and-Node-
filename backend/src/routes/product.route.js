import express from 'express';
import getAllProducts, { createProduct, deleteBatch, deleteProduct, getAllProductsTicket, getProductById, getProductByIdTicket, patchProduct, updateProduct } from '../controllers/product.controller.js';
import { getallProducts } from '../controllers/sales.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
const router = express.Router();

// Staff + Admin routes (put these FIRST)
router.get('/all', authorize("admin", "staff"), getallProducts);
router.get("/ticket", authorize("admin", "staff"), getAllProductsTicket);
router.get("/ticket/:id", authorize("admin", "staff"), getProductByIdTicket);
router.patch("/ticket/:id", authorize("admin", "staff"), patchProduct);

// Admin-only routes
router.get('/', authorize("admin"), getAllProducts);
router.get('/:id', authorize("admin"), getProductById);
router.post('/', authorize("admin"), createProduct);
router.patch('/:id', authorize("admin"), updateProduct);
router.delete('/:id', authorize("admin"), deleteProduct);
router.delete('/:id/batch/:batchId', authorize("admin"), deleteBatch);

export default router;