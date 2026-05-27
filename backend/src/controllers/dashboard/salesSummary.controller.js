import {Sales} from "../../models/sales.model.js";
const salesSummary = async (req, res) => {
  try {
    const days = parseInt(req.query.days);
    if (isNaN(days) || days <= 0) {
      return res
        .status(400)
        .json({ msg: "Provide a valid positive 'days' value" });
    }

    // Today at midnight (server time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cutOffDate = new Date(today);
    cutOffDate.setDate(today.getDate() - (days - 1));

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Initialize map with timestamp keys → 0
    const revenueMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(cutOffDate);
      d.setDate(cutOffDate.getDate() + i);
      revenueMap.set(d.getTime(), 0);
    }

    const data = await Sales.aggregate([
      { $match: { timestamp: { $gte: cutOffDate, $lte: endOfToday } } },
      {
        $lookup: {
          from: "products",
          localField: "productid",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$timestamp",
              unit: "day",
              timezone: "Asia/Kolkata",
            },
          },
          perDayRevenue: {
            $sum: {
              $multiply: [
                "$quantity",
                "$avgprice"
              ],
            },
          },
        },
      },
    ]);

    // Fill the map using timestamp keys
    for (const record of data) {
      const key = record._id.getTime();
      if (revenueMap.has(key)) {
        revenueMap.set(key, record.perDayRevenue);
      }
    }

    // Build response in the same {dates: [], revenue: []} format
    const response = {
      dates: Array.from(revenueMap.keys()).map((t) => new Date(t)),
      revenue: Array.from(revenueMap.values()),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("salesSummary error:", err);
    return res.status(500).json({
      msg: "Server error while fetching sales summary",
      error: err.message,
    });
  }
}

export default salesSummary