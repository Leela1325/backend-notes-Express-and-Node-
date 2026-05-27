import mongoose from "mongoose";
 
const inventoryBatchScehma = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    expirydate: {
      type: Date,
      required: [true, "Expiry Date is Required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
  }
);
 
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    zoneid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    categoryid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    supplierids: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplier",
        },
      ],
      default: [],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    inventory: {
      type: [inventoryBatchScehma],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
 
 
export const Product=mongoose.model("Product",productSchema,"products")
 