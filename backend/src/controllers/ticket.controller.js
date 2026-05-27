import mongoose from "mongoose";
import { Ticket } from "../models/ticket.model.js";
import { Product } from "../models/product.model.js";
import { Supplier } from "../models/supplier.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Activity } from "../models/activity.model.js";
import Zone from "../models/zone.model.js";
import { syncZoneCapacity } from "../utils/capacity.util.js";

const formatTicket = (t) => ({
  id: t._id.toString(),
  productid: t.productid?.toString() || null,
  productName: t.productName,
  requestedQuantity: t.requestedQuantity,
  supplierId: t.supplierId?.toString() || null,
  status: t.status,
  createdAt: t.createdAt,
  updatedat: t.updatedat,
});

const formatTicketWithJoins = (t) => {
  const product = t.product?.[0] || null;
  const suppliers = (t.suppliers || [])
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .map((s) => ({
      id: s._id.toString(),
      name: s.name,
      rating: s.rating,
      email: s.email,
      contact: s.contact,
      performance: s.performance,
      active: s.active,
    }));

  return {
    id: t._id.toString(),
    productid: t.productid?.toString() || null,
    productName: t.productName || product?.name || null,
    requestedQuantity: t.requestedQuantity,
    supplierId: t.supplierId?.toString() || null,
    status: t.status,
    createdAt: t.createdAt,
    updatedat: t.updatedat,
    product: product
      ? {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          inventory: product.inventory,
          supplierids: (product.supplierids || []).map((id) => id.toString()),
        }
      : null,
    suppliers,
  };
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.aggregate([
      { $addFields: { sortDate: { $ifNull: ["$updatedat", "$createdAt"] } } },
      { $sort: { sortDate: -1 } },
      { $lookup: { from: "products", localField: "productid", foreignField: "_id", as: "product" } },
      { $lookup: { from: "suppliers", localField: "product.supplierids", foreignField: "_id", as: "suppliers" } },
    ]);
    res.status(200).json(tickets.map(formatTicketWithJoins));
  } catch (error) {
    console.error("getAllTickets error:", error);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const tickets = await Ticket.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: "products", localField: "productid", foreignField: "_id", as: "product" } },
      { $lookup: { from: "suppliers", localField: "product.supplierids", foreignField: "_id", as: "suppliers" } },
    ]);
    if (!tickets.length) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json(formatTicketWithJoins(tickets[0]));
  } catch (error) {
    console.error("getTicketById error:", error);
    res.status(500).json({ message: "Error fetching ticket" });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { productid, productName, requestedQuantity } = req.body;

    if (!productid || !productName || !requestedQuantity)
      return res.status(400).json({ message: "Missing required fields" });
    if (requestedQuantity <= 0)
      return res.status(400).json({ message: "Quantity must be > 0" });

    // Zone capacity check
    const product = await Product.findById(productid);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const zone = await Zone.findById(product.zoneid);
    if (zone) {
      const available = zone.maxcapacity - zone.currentcapacity;
      if (available <= 0)
        return res.status(409).json({
          message: `Cannot raise ticket — zone "${zone.name}" is full (${zone.currentcapacity}/${zone.maxcapacity} units used).`,
          isFull: true, availablecapacity: 0, zoneName: zone.name,
        });
      if (requestedQuantity > available)
        return res.status(409).json({
          message: `Requested quantity (${requestedQuantity}) exceeds available space (${available}) in zone "${zone.name}".`,
          isFull: false, availablecapacity: available, requestedQuantity, zoneName: zone.name,
        });
    }

    const ticket = await Ticket.create({
      productid: new mongoose.Types.ObjectId(productid),
      productName,
      requestedQuantity,
      status: "PENDING",
      createdAt: new Date(),
    });

    res.status(201).json(formatTicket(ticket));
  } catch (error) {
    console.error("createTicket error:", error);
    res.status(500).json({ message: "Error creating ticket" });
  }
};

// strict: false — allows saving supplierId even though it's not in the schema
export const patchTicket = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.requestedQuantity && updates.requestedQuantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    if (updates.supplierId)
      updates.supplierId = new mongoose.Types.ObjectId(updates.supplierId);

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      strict: false,
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json(formatTicket(ticket));
  } catch (error) {
    console.error("patchTicket error:", error);
    res.status(500).json({ message: "Error updating ticket" });
  }
};

export const approveTicket = async (req, res) => {
  try {
    const found = await Ticket.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: "products", localField: "productid", foreignField: "_id", as: "product" } },
      { $lookup: { from: "suppliers", localField: "product.supplierids", foreignField: "_id", as: "suppliers" } },
    ]);

    if (!found.length) return res.status(404).json({ message: "Ticket not found" });

    const ticketDoc = found[0];
    const product = ticketDoc.product?.[0];
    const suppliers = ticketDoc.suppliers || [];

    if (ticketDoc.status === "APPROVED")
      return res.status(400).json({ message: "Already approved" });
    if (!ticketDoc.requestedQuantity || ticketDoc.requestedQuantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    if (!suppliers.length)
      return res.status(400).json({ message: "No suppliers found for this product" });

    // Zone capacity 
    const zone = await Zone.findById(product.zoneid);
    if (zone) {
      const available = zone.maxcapacity - zone.currentcapacity;
      if (available <= 0)
        return res.status(409).json({
          message: `Cannot approve — zone "${zone.name}" is now full.`,
          isFull: true, availablecapacity: 0, zoneName: zone.name,
        });
      if (ticketDoc.requestedQuantity > available)
        return res.status(409).json({
          message: `Cannot approve — only ${available} units of space left in "${zone.name}", but ticket requests ${ticketDoc.requestedQuantity}.`,
          isFull: false, availablecapacity: available, zoneName: zone.name,
        });
    }

    const reqSupplierId = req.body.supplierId;
    if (!reqSupplierId)
      return res.status(400).json({ message: "Supplier is required for approval" });
    if (!mongoose.Types.ObjectId.isValid(reqSupplierId))
      return res.status(400).json({ message: "Invalid supplier ID" });

    const chosenSupplierId = new mongoose.Types.ObjectId(reqSupplierId);

    await Product.findByIdAndUpdate(product._id, {
  $push: {
    inventory: {
      quantity: ticketDoc.requestedQuantity,
      expirydate: req.body.expirydate || null,
      price: req.body.price ?? null,   // NEW
    },
  },
  $set: { updatedat: new Date().toISOString() },
});

    // Sync zone capacity after inventory pushed
    await syncZoneCapacity(product.zoneid);

    // strict: false — allows saving supplierId even though it's not in the schema
    // updatedat: stamps approval time so recently approved tickets sort to the top in getAllTickets
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "APPROVED", supplierId: chosenSupplierId, updatedat: new Date() } },
      { new: true, strict: false }
    );

    await Purchase.create({
  productid: product._id,
  supplierid: chosenSupplierId,
  quantity: ticketDoc.requestedQuantity,
  timestamp: new Date(),
});

    await Activity.create({
      eventname: "Ticket Approved",
      eventdesc: `Ticket ${ticketDoc._id} approved for ${ticketDoc.requestedQuantity} units of ${ticketDoc.productName}`,
      timestamp: new Date(),
    });

    res.status(200).json(formatTicket(updatedTicket));
  } catch (error) {
    console.error("approveTicket error:", error);
    res.status(500).json({ message: "Error approving ticket", error: error.message });
  }
};

export const disapproveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status === "REJECTED")
      return res.status(400).json({ message: "Ticket already rejected" });

    // updatedat: same idea — keeps recently acted-on tickets near the top
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "REJECTED", updatedat: new Date() } },
      { new: true }
    );

    await Activity.create({
      eventname: "Ticket Rejected",
      eventdesc: `Ticket ${ticket._id} was rejected`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Ticket rejected", ticket: formatTicket(updatedTicket) });
  } catch (error) {
    console.error("disapproveTicket error:", error);
    res.status(500).json({ message: "Error disapproving ticket" });
  }
};

export const autoCreateLowStockTicket = async (product) => {
  if (!product) return;
  const totalQuantity = (product.inventory || []).reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  if (totalQuantity > 50) return;
  const existing = await Ticket.findOne({ productid: product._id, status: "PENDING" });
  if (existing) return;
  await Ticket.create({
    productid: product._id,
    productName: product.name,
    requestedQuantity: 50,
    status: "PENDING",
    createdAt: new Date(),
  });
};

export const checkLowStock = async (req, res) => {
  try {
    const products = await Product.find();
    let createdCount = 0;
    for (const product of products) {
      const totalQuantity = (product.inventory || []).reduce((sum, entry) => sum + (entry.quantity || 0), 0);
      if (totalQuantity > 50) continue;
      const existing = await Ticket.findOne({ productid: product._id, status: "PENDING" });
      if (existing) continue;
      await Ticket.create({
        productid: product._id,
        productName: product.name,
        requestedQuantity: 50,
        status: "PENDING",
        createdAt: new Date(),
      });
      createdCount++;
    }
    res.status(200).json({ message: `Stock check complete. ${createdCount} ticket(s) created.` });
  } catch (error) {
    console.error("checkLowStock error:", error);
   res.status(500).json({ message: "Error checking stock" });
  }
};