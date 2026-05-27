import {Product} from "../../models/product.model.js";
const productSummary = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          products: { $sum: 1 }, // count of products
          quantity: { $sum: { $sum: "$inventory.quantity" } }, // sum of all batch quantities
        },
      },
      { $project: { _id: 0, products: 1, quantity: 1 } },
    ]);

    const stats = result[0] || { products: 0, quantity: 0 };
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch product stats",
      error: err.message,
    });
  }
}

export default productSummary