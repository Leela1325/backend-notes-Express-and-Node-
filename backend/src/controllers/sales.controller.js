import mongoose from "mongoose";
import { Sales } from "../models/sales.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import Zone from "../models/zone.model.js";
import { Activity } from "../models/activity.model.js";
import { autoCreateLowStockTicket } from "./ticket.controller.js";
import { syncZoneCapacity } from "../utils/capacity.util.js";

const formatSale = (s) => ({
  id: s._id.toString(),
  productid: s.productid?.toString() || null,
  productname: s.productname,
  categoryid: s.categoryid?._id?.toString() || s.categoryid?.toString() || null,
  category: s.categoryid?.name || null,
  quantity: s.quantity,
  avgprice: s.avgprice ?? 0,
  timestamp: s.timestamp,
});

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate("categoryid", "name")
      .sort({ _id: -1 });
    res.status(200).json(sales.map(formatSale));
  } catch (error) {
    console.error("getAllSales error:", error);
    res.status(500).json({ message: "Error fetching sales" });
  }
};

export const getSalesFormData = async (req, res) => {
  try {
    const zones = await Zone.find();
    const categories = await Category.find();

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "zones",
          localField: "zoneid",
          foreignField: "_id",
          as: "zone",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryid",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);

    const formattedProducts = products.map((p) => {
      const zone = p.zone?.[0] || null;
      const category = p.category?.[0] || null;
      const totalQuantity = (p.inventory || []).reduce(
        (sum, b) => sum + (b.quantity || 0),
        0,
      );
      return {
        id: p._id.toString(),
        name: p.name,
        zoneid: p.zoneid?.toString() || null,
        zoneName: zone?.name || null,
        categoryid: p.categoryid?.toString() || null,
        categoryName: category?.name || null,
        price: p.price,
        inventory: p.inventory,
        totalQuantity,
      };
    });

    res.status(200).json({
      zones: zones.map((z) => ({ id: z._id.toString(), name: z.name })),
      categories: categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
      })),
      products: formattedProducts,
    });
  } catch (error) {
    console.error("getSalesFormData error:", error);
    res.status(500).json({ message: "Error fetching form data" });
  }
};

export const createSale = async (req, res) => {
  try {
    const { productname, quantity } = req.body;

    if (!productname || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid sale data" });
    }

    const product = await Product.findOne({ name: productname });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalStock = (product.inventory || []).reduce(
      (sum, batch) => sum + (batch.quantity || 0),
      0,
    );

    if (totalStock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let inventory = [...(product.inventory || [])].sort((a, b) => {
      const dateA = a.expirydate ? new Date(a.expirydate).getTime() : Infinity;
      const dateB = b.expirydate ? new Date(b.expirydate).getTime() : Infinity;
      return dateA - dateB;
    });

    const now = new Date();
    let expired  = inventory.filter ((batch) => {
        if(new Date(batch.expirydate) < now )
        {
            return true ;
        }
        else
        {
            return false ;
        }
    }) ;
    inventory = inventory.filter(
        (batch) => {
            if(new Date(batch.expirydate) < now)
            {
                return false 
            }
            return batch ;
        }
    );

    let remaining = quantity;
    let totalCost = 0;

    for (const batch of inventory) {
      if (remaining <= 0) break;

      const batchPrice = batch.price ?? product.price ?? 0;

      if (batch.quantity >= remaining) {
        totalCost += remaining * batchPrice;
        batch.quantity -= remaining;
        remaining = 0;
      } else {
        totalCost += batch.quantity * batchPrice;
        remaining -= batch.quantity;
        batch.quantity = 0;
      }
    }

    const avgPrice = Math.round((totalCost / quantity) * 100) / 100;

    const updatedInventory = inventory.filter((b) => b.quantity > 0);

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          inventory: updatedInventory,
          updatedat: new Date().toISOString(),
        },
      },
      { new: true },
    );
    console.log("Product inventory updated");

    await syncZoneCapacity(product.zoneid);

    let categoryName = "Uncategorized";
    if (product.categoryid) {
      const category = await Category.findById(product.categoryid);
      if (category) categoryName = category.name;
    }

    const sale = await Sales.create({
      productid: product._id,
      productname: product.name,
      categoryid: product.categoryid || null,
      quantity,
      avgprice: avgPrice,
      timestamp: new Date(),
    });
    console.log("Sale recorded");

    await Activity.create({
      eventname: "Sale Submitted",
      eventdesc: `${quantity} units sold for ${product.name} (${categoryName})`,
      timestamp: new Date(),
    });
    console.log("Activity logged");

    await autoCreateLowStockTicket(updatedProduct);

    const populatedSale = await sale.populate("categoryid", "name");
    res.status(201).json(formatSale(populatedSale));
  } catch (error) {
    console.error("createSale error:", error);
    res
      .status(500)
      .json({ message: "Error creating sale", error: error.message });
  }
};

//performance analytics
function getCutoffDate(days) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export const CategoryPerformers = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.categoryid)) {
      return res.status(400).json({ error: "Invalid category id" });
    }
    const days = Number(req.query.days) || 15;
    const sortType = req.query.type === "worst" ? 1 : -1;
    const cutoffDate = getCutoffDate(days);
    const categoryid = new mongoose.Types.ObjectId(req.params.categoryid);
    const data = await Sales.aggregate([
      {
        $match: { categoryid, timestamp: { $gte: cutoffDate } },
      },
      {
        $group: {
          _id: "$productid",
          total_sales: { $sum: "$quantity" },
        },
      },
      {
        $sort: {
          total_sales: sortType,
        },
      },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$product.name",
          category: "$product.categoryid",
          value: "$total_sales",
        },
      },
    ]);
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to fetch category performers",
    });
  }
};

export const getallCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({}).select(["name", "_id"]);
    res.json(allCategories);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to get all categories",
    });
  }
};

export const getallProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({}).select([
      "_id",
      "name",
      "description",
    ]);
    res.json(allProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to get all products",
    });
  }
};

export const getDailyUnitsByCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.categoryid)) {
      return res.status(400).json({ error: "Invalid category id" });
    }
    const categoryid = new mongoose.Types.ObjectId(req.params.categoryid);
    const days = parseInt(req.query.days) || 15;
    const cutoffDate = getCutoffDate(days);
    const raw = await Sales.aggregate([
      {
        $match: {
          categoryid,
          timestamp: {
            $gte: cutoffDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
              timezone: "Asia/Kolkata",
            },
          },
          total_revenue: {
            $sum: {
              $multiply: [
                "$quantity",
                {
                  $ifNull: ["$avgprice", 0],
                },
              ],
            },
          },
        },
      },
    ]);
    const salesByDate = new Map(
      raw.map((data) => [data._id, data.total_sales]),
    );
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dates = [];
    const sales = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = fmt.format(d);
      dates.push(key);
      sales.push(salesByDate.get(key) ?? 0);
    }
    res.json({ dates, sales });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to get daily sales by category",
    });
  }
};

export const getDailySalesByCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.categoryid)) {
      return res.status(400).json({ error: "Invalid category id" });
    }
    const categoryid = new mongoose.Types.ObjectId(req.params.categoryid);
    const days = Number(req.query.days) || 15;
    const cutoffDate = getCutoffDate(days);
    const raw = await Sales.aggregate([
      {
        $match: {
          categoryid,
          timestamp: {
            $gte: cutoffDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
              timezone: "Asia/Kolkata",
            },
          },
          total_revenue: {
            $sum: {
              $multiply: [
                "$quantity",
                {
                  $ifNull: ["$avgprice", 0],
                },
              ],
            },
          },
        },
      },
    ]);
    const revenueByDate = new Map(raw.map((d) => [d._id, d.total_revenue]));
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const dates = [];
    const revenue = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = fmt.format(d);
      dates.push(key);
      revenue.push(revenueByDate.get(key) ?? 0);
    }

    res.json({ dates, revenue });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get daily sales by category" });
  }
};

export const getProductOverview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productid)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const productId = new mongoose.Types.ObjectId(req.params.productid);
    const days = Number(req.query.days) || 30;

    const currentStart = getCutoffDate(days);
    const prevStart = getCutoffDate(days * 2); 

    const result = await Sales.aggregate([
      { $match: { productid: productId, timestamp: { $gte: prevStart } } },
      {
        $addFields: {
          revenue: { $multiply: ["$quantity", { $ifNull: ["$avgprice", 0] }] },
        },
      },
      {
        $facet: {
          current: [
            { $match: { timestamp: { $gte: currentStart } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$revenue" },
                unitsSold: { $sum: "$quantity" },
              },
            },
          ],
          previous: [
            { $match: { timestamp: { $gte: prevStart, $lt: currentStart } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$revenue" },
                unitsSold: { $sum: "$quantity" },
              },
            },
          ],
        },
      },
    ]);
    const facetDoc = result[0];
    const current = facetDoc.current[0] || { revenue: 0, unitsSold: 0 };
    const previous = facetDoc.previous[0] || { revenue: 0, unitsSold: 0 };

    const round2 = (n) => Math.round(n * 100) / 100;

    res.json({
      revenue: round2(current.revenue),
      revenuePrev: round2(previous.revenue),
      unitsSold: current.unitsSold,
      unitsSoldPrev: previous.unitsSold,
      avgPrice:
        current.unitsSold > 0 ? round2(current.revenue / current.unitsSold) : 0,
      avgPricePrev:
        previous.unitsSold > 0
          ? round2(previous.revenue / previous.unitsSold)
          : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get product overview" });
  }
};

export const getDailySalesByProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productid)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const productId = new mongoose.Types.ObjectId(req.params.productid);
    const days = Number(req.query.days) || 30;
    const cutoffDate = getCutoffDate(days);

    const raw = await Sales.aggregate([
      { $match: { productid: productId, timestamp: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
              timezone: "Asia/Kolkata",
            },
          },
          total_quantity: { $sum: "$quantity" },
        },
      },
    ]);
    const quantityByDate = new Map(raw.map((d) => [d._id, d.total_quantity]));
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const dates = [];
    const quantity = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = fmt.format(d);
      dates.push(key);
      quantity.push(quantityByDate.get(key) ?? 0);
    }

    res.json({ dates, quantity });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get daily sales by product" });
  }
};

export const getDailyCategorySales = async (req, res) => {
    try {
        const days = Number(req.query.days) || 30;
        const cutoffDate = getCutoffDate(days);

        const raw = await Sales.aggregate([
            { $match: { timestamp: { $gte: cutoffDate } } },

            { $lookup: {
                from: "categories",
                localField: "categoryid",
                foreignField: "_id",
                as: "categoryDoc"
            }},
            { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },

            { $group: {
                _id: {
                    day: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$timestamp",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    category: "$categoryDoc.name"
                },
                units: { $sum: "$quantity" }
            }},
            { $sort: { "_id.day": 1 } }
        ]);

        const fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            dates.push(fmt.format(d));
        }

        const byCategory = new Map();
        for (const row of raw) {
            const { day, category } = row._id;
            if (!day || !category) continue;
            if (!byCategory.has(category)) byCategory.set(category, new Map());
            byCategory.get(category).set(day, row.units);
        }

        const series = [...byCategory.entries()]
            .map(([name, dayMap]) => ({
                name,
                data: dates.map(d => dayMap.get(d) ?? 0)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        res.json({ dates, series });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to get daily category sales" });
    }
};

export const getProductPerformance = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productid)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const productId = new mongoose.Types.ObjectId(req.params.productid);

    const [product, agg] = await Promise.all([
      Product.findById(productId).select("name").lean(),
      Sales.aggregate([
        { $match: { productid: productId } },
        {
          $addFields: {
            revenue: {
              $multiply: ["$quantity", { $ifNull: ["$avgprice", 0] }],
            },
          },
        },
        {
          $facet: {
            monthly: [
              {
                $group: {
                  _id: {
                    $month: { date: "$timestamp", timezone: "Asia/Kolkata" },
                  },
                  revenue: { $sum: "$revenue" },
                  units: { $sum: "$quantity" },
                },
              },
            ],
            heatmap: [
              {
                $group: {
                  _id: {
                    month: {
                      $month: { date: "$timestamp", timezone: "Asia/Kolkata" },
                    },
                    dow: {
                      $isoDayOfWeek: {
                        date: "$timestamp",
                        timezone: "Asia/Kolkata",
                      },
                    },
                  },
                  units: { $sum: "$quantity" },
                },
              },
            ],
          },
        },
      ]),
    ]);

    const productName = product?.name ?? "Unknown";

    const revenue = Array(12).fill(0);
    const units = Array(12).fill(0);
    const heatmap = Array.from({ length: 12 }, () => Array(7).fill(0));

    const facetDoc = agg[0] || { monthly: [], heatmap: [] };

    for (const row of facetDoc.monthly) {
      const m = row._id - 1;
      revenue[m] = Math.round(row.revenue * 100) / 100;
      units[m] = row.units;
    }

    for (const row of facetDoc.heatmap) {
      const m = row._id.month - 1;
      const d = row._id.dow - 1;
      heatmap[m][d] = row.units;
    }

    res.json({ productName, revenue, units, heatmap });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get product performance" });
  }
};
