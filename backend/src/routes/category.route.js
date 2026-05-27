import express from 'express'
import  { fetchCategories, getAllCategories, getAllCategoriesTicket, getCategoryById, getCategoryByIdTicket } from '../controllers/category.controller.js';
import { getallCategories } from '../controllers/sales.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
const router=express.Router({mergeParams:true});

// Admin-only
router.get('/category-supplier', authorize("admin"), fetchCategories);

// Admin + Staff
router.get('/all', authorize("admin", "staff"), getallCategories);
router.get("/ticket", authorize("admin", "staff"), getAllCategoriesTicket);
router.get("/ticket/:id", authorize("admin", "staff"), getCategoryByIdTicket);
router.get('/', authorize("admin", "staff"), getAllCategories);
router.get('/:id', authorize("admin", "staff"), getCategoryById);

export default router;