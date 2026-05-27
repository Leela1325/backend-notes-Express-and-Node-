import {Activity} from "../../models/activity.model.js";
const recentActivity = async (req, res) => {
  const days = parseInt(req.query.days);
  let cutOffDate = null;
  if (days === 1) {
    cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - days);
  } else {
    let now = new Date();
    cutOffDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - days,
    );
  }
  try {
    const data = await Activity.find({ timestamp: { $gte: cutOffDate } }).sort({
      timestamp: -1,
    });
    res.status(200).json({data});

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch recent activity",
      error: err.message,
    });
  }
}

export default recentActivity