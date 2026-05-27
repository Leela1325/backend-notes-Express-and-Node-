import express from 'express';
import {Supplier} from '../models/supplier.model.js';
import mongoose from 'mongoose';
import {Product} from '../models/product.model.js'
import {Purchase } from '../models/purchase.model.js'

export const fetchSuppliers=async (req,res)=>{
    try{

        const zoneid=req.query.zoneid;
        const categoryid=req.query.categoryid;
        
        let suppliers=await Supplier.aggregate([

            {
                $match:{
                    zoneid:new mongoose.Types.ObjectId(zoneid),
                    categoryid:new mongoose.Types.ObjectId(categoryid)
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'_id',
                    foreignField:'supplierids',
                    as:'products'
                }
            }



        ]);

        suppliers=suppliers.map((eachsupplier)=>{
            eachsupplier.id=eachsupplier._id;
            delete eachsupplier._id;

            eachsupplier.products=eachsupplier.products.map(eachproduct=>{
                eachproduct.id=eachproduct.id;
                delete eachproduct._id;
                return eachproduct;
            })

            return eachsupplier;
        })
        res.status(200);
        res.json(suppliers);
    }
    catch(error){
        res.status(500);
        res.json({message:error.message});
    }
}


export const fetchSupplierByZoneid=async (req,res)=>{
    try{
        let zoneid=req.query.zoneid;
        let supplier=await Supplier.find({zoneid:zoneid});
        res.status(201);
        res.json(supplier);
    }
    catch(error)
    {
        res.status(500);
        res.json({message:error.message})
    }
}

export const updateSupplier=async(req,res)=>{
    try{
        let supplierid=req.params.supplierid;
        let data=req.body;
        const result=await Supplier.updateOne({_id:supplierid},data);
        res.status(204);
        res.json({message:'Successfully updated supplier details'});
    }
    catch(error)
    {
        res.status(500);
        res.json({message:error.message});
    }
}

export const deleteSupplier=async (req,res)=>{
    try{
        let supplierid=req.params.supplierid;
        let result=await Supplier.deleteOne({_id:supplierid});
        res.status(204);
        res.json({message:'Successfully deleted supplier'});
    }
    catch(error)
    {
        res.status(500);
        res.json({message:error.message});
    }
}


export const addSupplier=async (req,res)=>{
    try{
        let data=req.body;
        await Supplier.insertOne(data);
        res.status(201);
        let supplier=await Supplier.findOne({name:data.name,email:data.email,zoneid:data.zoneid,categoryid:data.categoryid});
        
 const formatted = {
      id: supplier._id.toString(),
      name: supplier.name,
      email: supplier.email,
      contact: supplier.contact,
      address: supplier.address,
      performance: supplier.performance,
      zoneid: supplier.zoneid?.toString() || null,
      categoryid: supplier.categoryid?.toString() || null,
      active: supplier.active,
      rating: supplier.rating,
      productids: supplier.productids || [],
      products: [] 
    };
        
        res.json(formatted);
    }
    catch(error){
          res.status(500);
        res.json({message:error.message});
    }
}


export const fetchSupplierById=async (req,res)=>{
    try{
        let supplierid=req.params.supplierid;
        let supplier=await Supplier.findById(supplierid);
        supplier.id=supplier._id;
        delete supplier._id;
        res.status(201);
        res.json(supplier);
    }
     catch(error){
          res.status(500);
        res.json({message:error.message});
    }
}

export const updateSupplierRating=async (req,res)=>{
    try{
        let supplierid=req.params.supplierid;
        let data=req.body;
        let rating=data.rating;
        let performance="";
        if(Math.round(rating)==1)performance='Poor'
        else if(Math.round(rating)==2)performance='Average';
        else if(Math.round(rating)==3)performance='Good';
        else if(Math.round(rating)==4)performance='Very Good';
        else performance='Excellent';

        let modifiedData={
            rating,
            performance
        }


        await Supplier.findByIdAndUpdate(supplierid,modifiedData);
        res.status(202);
        res.json({message:'Successfully updated rating'});
    }
     catch(error){
          res.status(500);
        res.json({message:error.message});
    }
}


export const fetchOptimalSupplierList=async (req,res)=>{
    try{
        let productid=req.query.productid;
        let wholeData=await Product.aggregate([
            {
                $match:{
                    "_id":new mongoose.Types.ObjectId(productid)
                }
            },
            {
                $lookup:{
                    from:'suppliers',
                    localField:'supplierids',
                    foreignField:'_id',
                    as:'suppliers'

                }
            },
            {
                $project:{
                    "suppliers":1,
                    "_id":0
                }
            },{
                $sort:{
                    "suppliers.rating":-1
                }
            }


        ]);
        let supplierData=wholeData[0];

        let {suppliers:supplierArray}=supplierData;


        supplierArray=supplierArray.map((supplier)=>{
            supplier.id=supplier._id;
            delete supplier._id;
            return supplier;
        })
        
        res.status(201);
        res.json(supplierArray);



    }
    catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}



export const fetchProductsByIds=async (req,res)=>{
    try{
        let ids=req.query.ids;
       
        let products=[];
        for(let id of ids)
        {
            let product=await Product.findById(id);
            product.id=product._id;
            delete  product._id;
            products.push(product);
        }
       
        res.status(200);
        res.json(products);
    }  
     catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}


export const mapSuppliersWithProduct=async (req,res)=>{
    try{
        let productid=req.query.productid;
        let supplierids=req.query.supplierids;
        
    const supplierIdsArray = [].concat(supplierids);
        await Product.findByIdAndUpdate(productid,{
            
         $addToSet:{
            'supplierids':{
        $each:
            supplierIdsArray
    }
         }
        });
        
    

    
            await Supplier.updateMany({_id:{$in:supplierIdsArray}},{
                $addToSet:{
                    'productids':productid
                }
            })
        



        res.status(203);
        res.json({message:'Successfully updated suppliers for product'});

    }
      catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}

export const unMapSuppliersWithProduct=async (req,res)=>{
    try{
        let productid=req.query.productid;
        let supplierids=req.query.supplierids;
        
        const supplierIdsArray=[].concat(supplierids);
        //update product
        await Product.findByIdAndUpdate(productid,{
            
         $pullAll:{
            'supplierids':supplierIdsArray
         }
        });

     
            await Supplier.updateMany({_id:{$in:supplierIdsArray}},{
                $pull:{
                    'productids':productid
                }
            })
        



        res.status(203);
        res.json({message:'Successfully updated suppliers for product'});

    }
      catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}



export const removeProductFromSuppliers=async (req,res)=>{
    try{
        let productid=req.body.productid;
        let supplierids=req.body.supplierids;
    const supplierIdsArray = [].concat(supplierids);
        await Supplier.updateMany({_id:{$in:supplierIdsArray}},{
            $pull:{
                'productids':productid
            }
        })

        res.status(202);
        res.json({message:'Successfully removed product id from suppliers'});
    }
      catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}


export const removeSupplierFromProducts=async (req,res)=>{
    try{
        let productids=req.body.productids;
        let supplierid=req.body.supplierid;

            const productIdsArray = [].concat(productids);
        await Product.updateMany({_id:{$in:productIdsArray}},{
            $pull:{
                'supplierids':supplierid
            }
        })

        res.status(202);
        res.json({message:'Successfully removed product id from suppliers'});
    }
      catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}

export const fetchProductsUsingSupplierId=async (req,res)=>{
    try{
        let supplierid=req.query.supplierid;
        let products=await Product.find({supplierids:supplierid});
        products=products.map((product)=>{
            product.id=product._id;
            delete product._id;
            return product;
        })
        res.status(200);
        res.json(products)
    }
     catch(error)
    {
         res.status(500);
        res.json({message:error.message});
    }
}

// Tickets Part in supplier

const formatSupplier = (s) => ({
  id: s._id.toString(),
  name: s.name,
  contact: s.contact,
  address: s.address,
  performance: s.performance,
  email: s.email,
  zoneid: s.zoneid?.toString() || null,
  categoryid: s.categoryid?.toString() || null,
  active: s.active,
  rating: s.rating,
  productids: (s.productids || []).map((id) => id.toString()),
});

export const getAllSuppliersTicket = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    console.log(suppliers.map(formatSupplier))
    res.status(200).json(suppliers.map(formatSupplier));
  } catch (error) {
    console.error("getAllSuppliers error:", error);
    res.status(500).json({ message: "Error fetching suppliers" });
  }
};

export const getSupplierByIdTicket = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(formatSupplier(supplier));
  } catch (error) {
    console.error("getSupplierById error:", error);
    res.status(500).json({ message: "Error fetching supplier" });
  }
};


export const getPurchaseQuantityBySupplier = async (req, res) => {
  try {
    const { supplierids } = req.query;
    const idsArray = supplierids.split(",").map(id => new mongoose.Types.ObjectId(id));

  
    const products = await Product.find({
      supplierids: { $in: idsArray }
    });


    const productSupplierMap = {};
    products.forEach(product => {
      productSupplierMap[product._id.toString()] = product.supplierids.map(id => id.toString());
    });


    const productIds = products.map(p => p._id);
    const purchases = await Purchase.find({
      productid: { $in: productIds }
    });

  
    const supplierQuantityMap = {};
    purchases.forEach(purchase => {
      const pid = purchase.productid.toString();
      const supplierIds = productSupplierMap[pid] || [];
      supplierIds.forEach(sid => {
        if (idsArray.some(id => id.toString() === sid)) {
          supplierQuantityMap[sid] = (supplierQuantityMap[sid] || 0) + purchase.quantity;
        }
      });
    });

    const data = Object.entries(supplierQuantityMap).map(([_id, totalQuantity]) => ({
      _id,
      totalQuantity
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const getSupplierPurchaseWithFeedback = async (req, res) => {
//   try {
//     const { supplierid } = req.query;

//     // Get supplier details
//     const supplier = await Supplier.findById(supplierid);
//     if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

//     // Get all products of this supplier
//     const products = await Product.find({
//       supplierids: suppleerid
//     });

//     const productIds = products.map(p => p._id);

//     // Get all purchases for these products
//     const purchases = await Purchase.find({
//       productid: { $in: productIds }
//     }).sort({ timestamp: 1 });

//     const data = purchases.map((p, index) => ({
//       index: index + 1,
//       quantity: p.quantity,
//       timestamp: p.timestamp,
//       productid: p.productid
//     }));

//     res.status(200).json({
//       success: true,
//       supplier: {
//         name: supplier.name,
//         rating: supplier.rating,
//         performance: supplier.performance
//       },
//       data
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getAllSuppliersPurchaseFeedback = async (req, res) => {
  try {
    const { supplierids } = req.query;
    const idsArray = supplierids.split(",").map(id => new mongoose.Types.ObjectId(id));

    const suppliers = await Supplier.find({ _id: { $in: idsArray } });

    const result = await Promise.all(suppliers.map(async (supplier) => {
      const products = await Product.find({ supplierids: supplier._id });
      const productIds = products.map(p => p._id);
      const purchases = await Purchase.find({ 
        productid: { $in: productIds } 
      }).sort({ timestamp: 1 });

      return {
        supplierid: supplier._id,
        name: supplier.name,
        rating: supplier.rating,
        performance: supplier.performance,
        purchases: purchases.map(p => ({
          quantity: p.quantity,
          timestamp: p.timestamp
        })).filter(p => p.timestamp>new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      };
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};