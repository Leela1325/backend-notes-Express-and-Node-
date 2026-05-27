import {Product} from "../../models/product.model.js";
import mongoose from "mongoose";
import Zone from "../../models/zone.model.js";
const getCategoryDistrubitionByZoneId = async (req, res) => {
  try {
    const { zoneid } = req.query;

    // ─── Validations ──────────────────────────────────────────
    if (!zoneid) {
      return res.status(400).json({ msg: "zoneid is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(zoneid)) {
      return res.status(400).json({ msg: "Invalid zoneid format" });
    }

    const zoneObjectId = new mongoose.Types.ObjectId(zoneid);

    // ─── Optional: check if zone actually exists ──────────────
    const zoneExists = await Zone.exists({ _id: zoneObjectId });
    if (!zoneExists) {
      return res.status(404).json({ msg: "Zone not found" });
    }

    // ─── Aggregation: get quantity per category ──────────────
    const distribution = await Product.aggregate([
      { $match: { zoneid: zoneObjectId } },

      { $unwind: { path: "$inventory" } },

      {
        $group: {
          _id: "$categoryid",
          quantity: { $sum: "$inventory.quantity" }
        }
      },

      { $match: { quantity: { $gt: 0 } } },

      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },

      {
        $project: {
          _id: 0,
          quantity: 1,
          categoryName: { $arrayElemAt: ["$categoryDetails.name", 0] }
        }
      }
    ]);

    // ─── Handle empty zone (no stock) ─────────────────────────
  // Empty zone case — change to:
if (distribution.length === 0) {
  return res.status(200).json([]);   // just an empty array
}

    // ─── Convert quantities → percentages ─────────────────────
    const total = distribution.reduce((sum, d) => sum + d.quantity, 0);

    const result = distribution
      .map(d => ({
        categoryName: d.categoryName ?? "Uncategorized",
        percentage: total === 0 ? 0 : Math.round((d.quantity / total) * 1000) / 10
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return res.status(200).json(result);

  } catch (err) {
    console.error("distribution error:", err);
    return res.status(500).json({
      msg: "Server error while fetching distribution",
      error: err.message
    });
  }
}   

export default getCategoryDistrubitionByZoneId