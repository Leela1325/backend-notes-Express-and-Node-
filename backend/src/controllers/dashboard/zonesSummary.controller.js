 import Zone from "../../models/zone.model.js";
 const zonesSummary = async (req, res) => {
  try {
    const result = await Zone.aggregate([
      {
        $group: {
          _id: null,
          totalZones: { $sum: 1 },
          totalMaximumCapacity: { $sum: "$maxcapacity" },
          totalCurrentCapacity: { $sum: "$currentcapacity" },
        },
      },
      {
        $project: {
          _id: 0,
          totalZones: 1,
          totalMaximumCapacity: 1,
          totalCurrentCapacity: 1,
        },
      },
    ]);

    let stats = result[0] ;
    stats = {...stats , totalAvailableCapacity : stats.totalMaximumCapacity - stats.totalCurrentCapacity} ;
    res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch zone stats",
      error: err.message,
    });
  }
}

export default zonesSummary ;