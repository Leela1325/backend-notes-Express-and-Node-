import {Sales} from "../../models/sales.model.js";
import {Purchase} from "../../models/purchase.model.js";
const stockInStockOut = async (req, res) => {
  try {
    const days = 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cutOffDate = new Date(today);
    cutOffDate.setDate(today.getDate() - (days - 1));

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const stockInMap = new Map();
    const stockOutMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(cutOffDate);
      d.setDate(cutOffDate.getDate() + i);
      const key = d.getTime();
      stockInMap.set(key, 0);
      stockOutMap.set(key, 0);
    }

    const buildPipeline = () => [
      { $match: { timestamp: { $gte: cutOffDate, $lte: endOfToday } } },
      {
        $group: {
          _id: {
            $dateTrunc: {
              // ✅ $dateTrunc
              date: "$timestamp",
              unit: "day",
              timezone: "Asia/Kolkata",
            },
          },
          quantity: { $sum: "$quantity" },
        },
      },
    ];

    const [purchases, sales] = await Promise.all([
      Purchase.aggregate(buildPipeline()),
      Sales.aggregate(buildPipeline()),
    ]);

    for (const record of purchases) {
      const key = record._id.getTime();
      if (stockInMap.has(key)) {
        stockInMap.set(key, record.quantity);
      }
    }

    for (const record of sales) {
      const key = record._id.getTime();
      if (stockOutMap.has(key)) {
        stockOutMap.set(key, record.quantity);
      }
    }

    return res.status(200).json({
      dates: Array.from(stockInMap.keys()).map((t) => new Date(t)),
      stockIn: Array.from(stockInMap.values()),
      stockOut: Array.from(stockOutMap.values()),
    });
  } catch (err) {
    console.error("stockInStockOut error:", err);
    return res.status(500).json({
      msg: "Server error while fetching stock data",
      error: err.message,
    });
  }
}

export default stockInStockOut   ;