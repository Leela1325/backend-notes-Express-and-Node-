import Zone from "../models/zone.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

export const getZoneStatus = (availablecapacity, maxcapacity) => {
  const fillPercent = ((maxcapacity - availablecapacity) / maxcapacity) * 100;
  if (availablecapacity <= 0) return "Full";
  if (fillPercent >= 90) return "Nearly Full";
  return "Available";
};

export const enrichZone = (zone, categoryCount, productCount) => ({
  id: zone._id.toString(),
  name: zone.name,
  maxcapacity: zone.maxcapacity,
  currentcapacity: zone.currentcapacity,
  availablecapacity: zone.maxcapacity - zone.currentcapacity,
  categoryCount,
  productCount,
  status: getZoneStatus(
    zone.maxcapacity - zone.currentcapacity,
    zone.maxcapacity,
  ),
});

const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find();
    // console.log(zones);
    const enriched = await Promise.all(
      zones.map(async (zone) => {
        const [categoryCount, productCount] = await Promise.all([
          Category.countDocuments({ zoneid: zone._id }),
          Product.countDocuments({ zoneid: zone._id }),
        ]);
        return enrichZone(zone, categoryCount, productCount);
      }),
    );
    res.status(200).send(enriched);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Zones",
      error: error.message,
    });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    // console.log(zone);
    if (!zone) return res.status(404).json({ message: "zone not found" });
    const [categoryCount, productCount] = await Promise.all([
      Category.countDocuments({ zoneid: zone._id }),
      Product.countDocuments({ zoneid: zone._id }),
    ]);
    res.status(200).send(enrichZone(zone, categoryCount, productCount));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch zone by id",
      error: error.message,
    });
  }
};

export const getZoneCapacityStatus = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    // const available = zone.maxcapacity - zone.currentcapacity;
    // const fillPercent = Math.round((zone.currentcapacity / zone.maxcapacity) * 100);
    const available = zone.maxcapacity - zone.currentcapacity;
    const status = getZoneStatus(available, zone.maxcapacity);
    res.json({
      zoneid: zone._id,
      zoneName: zone.name,
      maxcapacity: zone.maxcapacity,
      currentcapacity: zone.currentcapacity,
      availablecapacity: available,
      status,
      message:
        status === "Full"? `Cannot add stock — zone "${zone.name}" is full.`: status === "Nearly Full"
            ? `Warning: only ${available} units of space left in "${zone.name}".`
            : null,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get capacity status", error: err.message });
  }
};

export default getAllZones;


//supplier controllers
export const fetchZones = async (req, res) => {
  try {
    let zone = await Zone.aggregate([
      {
        $addFields: {
          availablecapacity: {
            $subtract: ["$maxcapacity", "$currentcapacity"],
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "zoneid",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "zoneid",
          as: "suppliers",
        },
      },
    ]);
    zone = zone.map((singlezone) => {
      singlezone.id = singlezone._id;
      delete singlezone._id;
 
      singlezone.categories = singlezone.categories.map((each_category) => {
        each_category.id = each_category._id;
        delete each_category._id;
        return each_category;
      });
 
      singlezone.suppliers = singlezone.suppliers.map((eachsupplier) => {
        eachsupplier.id = eachsupplier._id;
        delete eachsupplier._id;
        return eachsupplier;
      });
 
      return singlezone;
    });
 
    res.status(201);
    res.json(zone);
  } catch (error) {
    res.status(500);
    res.json({ message: "Unable to fetch data from Database" });
  }
};
 
//fetcing zone-supplier here
export const fetchZone = async (req, res) => {
  const zoneid = req.params.zoneid;
  try {
    const zonedata = await Zone.findById(zoneid);
 console.log(zonedata);
    res.status(200);
    res.json(zonedata);

  } catch (error) {
    res.status(500);
    res.json({ message: "Unable to fetch zone data" });
  }
};

//ticket 
const formatZone = (z) => ({
  id: z._id.toString(),
  name: z.name,
});

export const getAllZonesTicket = async (req, res) => {
  try {
    const zones = await Zone.find();
    res.status(200).json(zones.map(formatZone));
  } catch (error) {
    console.error("getAllZones error:", error);
    res.status(500).json({ message: "Error fetching zones" });
  }
};

export const getZoneByIdTicket = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    res.status(200).json(formatZone(zone));
  } catch (error) {
    console.error("getZoneById error:", error);
    res.status(500).json({ message: "Error fetching zone" });
  }
};