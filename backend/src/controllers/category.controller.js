import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import Zone from "../models/zone.model.js";
import { Product } from "../models/product.model.js";

const enrichCategory = (category, productCount, zoneName) => ({
  id: category._id,
  name: category.name,
  zoneid: category.zoneid,
  description: category.description,
  productCount,
  zoneName,
});

export const getAllCategories = async (req, res) => {
  try {
    const filter = req.query.zoneid ? { zoneid: req.query.zoneid } : {};
    const categories = await Category.find(filter);
    // console.log(categories);
    const enriched = await Promise.all(
      categories.map(async (category) => {
        const [productCount, zone] = await Promise.all([
          Product.countDocuments({ categoryid: category._id }),
          Zone.findById(category.zoneid).select('name'),
        ]);
        return enrichCategory(category, productCount, zone?.name ?? 'Unknown');
      })
    );
 
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    // console.log(category);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const [productCount, zone] = await Promise.all([
      Product.countDocuments({ categoryid: category._id }),
      Zone.findById(category.zoneid).select('name'),
    ]);
 
    res.json(enrichCategory(category, productCount, zone?.name ?? 'Unknown'));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category', error: err.message });
  }
};

//supplier
export const fetchCategories=async (req,res)=>{
    try{
        const zoneid=req.query.zoneid;
       
        let categories=await Category.aggregate([
            {
                $match:{
                    zoneid:new mongoose.Types.ObjectId(zoneid)
                }
            },
            {
                $lookup:{
                    from:'suppliers',
                    localField:'_id',
                    foreignField:'categoryid',
                    as:'suppliers'
                }
            }
        ]);
       
        categories=categories.map((eachcategory)=>{
            eachcategory.id=eachcategory._id;
            delete eachcategory._id;
 
            eachcategory.suppliers=eachcategory.suppliers.map(eachsupplier=>{
                eachsupplier.id=eachsupplier._id;
                delete eachsupplier._id;
                return eachsupplier;
            });
            return eachcategory;
        })
 
        res.status(200);
        res.json(categories);
    }
    catch(error){
        res.status(500);
        res.json({message:error.message})
    }
}
 
//ticket
const formatCategory = (c) => ({
  id: c._id.toString(),
  name: c.name,
});

export const getAllCategoriesTicket = async (req, res) => {
  try {
    const { zoneid } = req.query;

    if (zoneid) {
      const products = await Product.find({ zoneid });

      const categoryIds = [
        ...new Set(
          products
            .map((p) => p.categoryid?.toString())
            .filter((id) => !!id),
        ),
      ];

      const categories = await Category.find({ _id: { $in: categoryIds } });
      return res.status(200).json(categories.map(formatCategory));
    }

    const categories = await Category.find();
    res.status(200).json(categories.map(formatCategory));
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const getCategoryByIdTicket = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(formatCategory(category));
  } catch (error) {
    console.error("getCategoryById error:", error);
    res.status(500).json({ message: "Error fetching category" });
  }
};
 