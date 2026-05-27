import Zone from "../../models/zone.model.js";
const getZones = async (req, res) => {
  try {
    const zones = await Zone.find({}, { _id: 1, name: 1 }).lean();
    const result = zones.map(z => ({
      id: z._id.toString(),
      name: z.name,
    }));
    return res.status(200).json(result);
  } catch (err) {
    console.error("zones error:", err);
    return res.status(500).json({
      msg: "Server error while fetching zones",
      error: err.message,
    });
  }
}

export default getZones ;