import {Sales} from "../../models/sales.model.js"
const todaySales = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    // console.log(startOfToday) ;
    // console.log(startOfToday.toISOString());
    const result = await Sales.aggregate([
      {
        $match: { timestamp: { $gt: startOfToday } },
      },
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
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$quantity",
               "$avgprice"
              ],
            },
          },
        },
      },
      { $project: { _id: 0, totalQuantity: 1, totalRevenue: 1 } },
    ]);

    let stats = result[0] || { totalQuantity: 0, totalRevenue: 0 };
    stats = { ...stats, date: startOfToday };
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch sales stats",
      error: err.message,
    });
  }
}

export default todaySales