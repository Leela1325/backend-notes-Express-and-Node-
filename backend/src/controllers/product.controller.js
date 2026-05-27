import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import Zone from "../models/zone.model.js";
import { Category } from "../models/category.model.js";
import { syncZoneCapacity } from "../utils/capacity.util.js";
import {Supplier}from "../models/supplier.model.js";
const enrichProduct = (product, zoneName, categoryName) => ({
  id: product._id.toString(),
  name: product.name,
  zoneid: product.zoneid.toString(),
  categoryid: product.categoryid.toString(),
  supplierids: product.supplierids.map((s) => s.toString()),
  description: product.description,
  inventory: product.inventory.map((batch) => ({
    _id: batch._id.toString(),
    quantity: batch.quantity,
    expirydate: batch.expirydate,
    price: batch.price,
  })),
  updatedat: product.updatedAt,
  zoneName: zoneName ?? null,
  categoryName: categoryName ?? null,
});
 
const getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.zoneid) filter.zoneid = req.query.zoneid;
    if (req.query.categoryid) filter.categoryid = req.query.categoryid;
 
    const products = await Product.find(filter);
 
    const enriched = await Promise.all(
      products.map(async (product) => {
        const [zone, category] = await Promise.all([
          Zone.findById(product.zoneid).select("name"),
          Category.findById(product.categoryid).select("name"),
        ]);
 
        return enrichProduct(product, zone?.name, category?.name);
      }),
    );
 
    return res.status(200).send(enriched);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all the products",
      error: error.message,
    });
  }
};
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product is not available" });
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product by id",
    });
  }
};
 
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      zoneid,
      categoryid,
      supplierids = [],
      price,
      description = "",
      inventory = [],
      quantity,
      expirydate,
    } = req.body;
    let batches = [];
    if (inventory.length > 0) {
      batches = inventory;
    } else if (quantity && expirydate) {
      batches = [{ quantity: Number(quantity), expirydate }];
    } else {
      batches = [];
    }
    if (batches.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one inventory batch is required" });
    }
    const incomingQty = batches.reduce(
      (sum, batch) => sum + (batch.quantity ?? 0),
      0,
    );
    const zone = await Zone.findById(zoneid);
    if (!zone) {
      return res.status(400).json({
        message: "Zone not found",
      });
    }
 
    const available = zone.maxcapacity - zone.currentcapacity;
    if (available <= 0){
      return res.status(409).json({
        message: `Cannot add stock — zone "${zone.name}" is full.`,
        isFull: true,
        availablecapacity: available,
      });
    }
    if (incomingQty > available){
      return res.status(409).json({
        message: `Not enough space. Requested ${incomingQty} but only ${available} available in "${zone.name}".`,
        isFull: false, availablecapacity: available, requestedQuantity: incomingQty,
      });
    }
 
    // const existing = await Product.findOne({
    //   name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    //   categoryid,
    // });
    // if(existing){
    //   existing.inventory.push(...batches);
    //   if (supplierids.length) {
    //     const merged = new Set([...existing.supplierids.map(String), ...supplierids.map(String)]);
    //     existing.supplierids = [...merged];
    //   }
    //   await existing.save();
    //   await syncZoneCapacity(zoneid);
 
    //   const [z, c] = await Promise.all([
    //     Zone.findById(existing.zoneid).select('name'),
    //     Category.findById(existing.categoryid).select('name'),
    //   ]);
    //   return res.status(200).json({
    //     message: 'Stock batch added to existing product.',
    //     product: enrichProduct(existing, z?.name, c?.name),
    //     merged: true,
    //   });
    // }
 
    const product = new Product({ name: name.trim(), zoneid, categoryid, supplierids, price, description, inventory: batches });
    await product.save();
      if (supplierids && supplierids.length > 0) {
      await Supplier.updateMany(
        { _id: { $in: supplierids } },
        { $addToSet: { productids: product._id } }
      );
    }
    await syncZoneCapacity(zoneid);
 
    const [z, c] = await Promise.all([
      Zone.findById(product.zoneid).select('name'),
      Category.findById(product.categoryid).select('name'),
    ]);
    res.status(201).json({
      message: 'Product created successfully.',
      product: enrichProduct(product, z?.name, c?.name),
      merged: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "error creating product",
      error: error.message,
    });
  }
};
 
 
 
 export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
 
    const { name, price, description, supplierids, inventory, addBatch, removeBatchIndex } = req.body;
    let inventoryChanged = false;
 
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (supplierids !== undefined) product.supplierids = supplierids;
 
    if (inventory !== undefined) {
      // capacity check — only check the ADDED quantity, not the full array
      const currentQty = product.inventory.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const newQty = inventory.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const diff = newQty - currentQty; // how many units are being added
 
      if (diff > 0) {
        const zone = await Zone.findById(product.zoneid);
        if (zone) {
          const available = zone.maxcapacity - zone.currentcapacity;
          if (available <= 0)
            return res.status(409).json({
              message: `Cannot add batch — zone "${zone.name}" is full.`,
              isFull: true, availablecapacity: available,
            });
          if (diff > available)
            return res.status(409).json({
              message: `Not enough space. Requested ${diff} but only ${available} available in "${zone.name}".`,
              isFull: false, availablecapacity: available, requestedQuantity: diff,
            });
        }
      }
 
      product.inventory = inventory;
      inventoryChanged = true;
    }
 
    if (addBatch) {
      const zone = await Zone.findById(product.zoneid);
      if (zone) {
        const available = zone.maxcapacity - zone.currentcapacity;
        if (addBatch.quantity > available)
          return res.status(409).json({
            message: `Cannot add batch — only ${available} units of space left in "${zone.name}".`,
            isFull: available <= 0, availablecapacity: available,
          });
      }
      product.inventory.push(addBatch);
      inventoryChanged = true;
    }
 
    if (removeBatchIndex !== undefined) {
      const idx = Number(removeBatchIndex);
      if (idx >= 0 && idx < product.inventory.length) {
        product.inventory.splice(idx, 1);
        inventoryChanged = true;
      }
    }
 
    await product.save();
    if (inventoryChanged) await syncZoneCapacity(product.zoneid);
 
    const [zone, category] = await Promise.all([
      Zone.findById(product.zoneid).select('name'),
      Category.findById(product.categoryid).select('name'),
    ]);
    res.json({ message: 'Product updated successfully.', product: enrichProduct(product, zone?.name, category?.name) });
 
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { zoneid } = product;
    await product.deleteOne();
    await syncZoneCapacity(zoneid);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
 
// DELETE /products/:id/batch/:batchId
export const deleteBatch = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
 
    console.log('batchId param:', req.params.batchId);
    console.log('inventory _ids:', product.inventory.map(b => b._id.toString()));
    const batchExists = product.inventory.id(req.params.batchId);
    console.log('batchExists:', batchExists);
    if (!batchExists)
      return res.status(404).json({ message: 'Batch not found' });
 
    if (product.inventory.length === 1)
      return res.status(400).json({ message: 'Cannot remove the last batch. Use delete product instead.' });
 
    product.inventory.pull({ _id: req.params.batchId });
    await product.save();
    await syncZoneCapacity(product.zoneid);
 
    const [zone, category] = await Promise.all([
      Zone.findById(product.zoneid).select('name'),
      Category.findById(product.categoryid).select('name'),
    ]);
 
    res.json({ message: 'Batch removed successfully.', product: enrichProduct(product, zone?.name, category?.name) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete batch', error: err.message });
  }
};
export default getAllProducts;
 


//ticket
const getTotalQuantity = (inventory = []) =>
  inventory.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
const formatProduct = (p) => ({
  id: p._id.toString(),
  name: p.name,
  zoneid: p.zoneid?.toString() || null,
  categoryid: p.categoryid?.toString() || null,
  supplierids: (p.supplierids || []).map((id) => id.toString()),
  price: p.price,
  description: p.description,
  inventory: p.inventory,
  totalQuantity: getTotalQuantity(p.inventory),
  updatedat: p.updatedat,
});
export const getAllProductsTicket = async (req, res) => {
  try {
    const { zoneid, categoryid, name } = req.query;
    const filter = {};
    if (zoneid) filter.zoneid = zoneid;
    if (categoryid) filter.categoryid = categoryid;
    if (name) filter.name = name;
    const products = await Product.find(filter);
    res.status(200).json(products.map(formatProduct));
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};
export const getProductByIdTicket = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(formatProduct(product));
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
};
export const patchProduct = async (req, res) => {
  try {
    const updates = { ...req.body, updatedat: new Date().toISOString() };
    console.log("hellooo")
    console.log(updates)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    await autoCreateLowStockTicket(product);
    res.status(200).json(formatProduct(product));
  } catch (error) {
    console.error("patchProduct error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};
 