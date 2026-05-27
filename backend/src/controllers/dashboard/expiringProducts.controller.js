import {Product} from "../../models/product.model.js";
const expiringProducts = async (req, res) => {
  const days = parseInt(req.query.days);

  if (isNaN(days) || days < 0) {
    return res
      .status(400)
      .json({ msg: "bad request: 'days' must be a positive number" });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() + days);
  cutOffDate.setHours(23, 59, 59, 999);

  console.log("Now:", now.toISOString());
  console.log("CutOff:", cutOffDate.toISOString());

  try {
    const data = await Product.aggregate([
      { $unwind: "$inventory" },
      {
    $match: {
      "inventory.expirydate": { $gte: now, $lte: cutOffDate },
    },
      },
      {
        $project: {
          _id : 0,
          name: 1,
          id : "$inventory._id",
          expirydate: "$inventory.expirydate",
          quantity: "$inventory.quantity",
        },
      },
    ]);
    res.status(200).json({ count: data.length, expiringItems: data });
  } catch (err) {
    res.status(500).json({ msg: "server error", error: err.message });
  }
}

export default expiringProducts