import mongoose from "mongoose";

const purchase = new mongoose.Schema({
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  supplierid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },
  quantity: Number,
  timestamp: Date,
});

export const Purchase = mongoose.model("Purchase", purchase);