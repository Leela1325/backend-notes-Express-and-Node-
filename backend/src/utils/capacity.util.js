import { Product } from "../models/product.model.js";
import Zone from "../models/zone.model.js";

export const getTotalQuantity=(inventory=[])=>inventory.reduce((sum,batch)=>
    sum+(batch.quantity??0),0);

export const syncZoneCapacity=async(zoneid)=>{
    const products=await Product.find({zoneid:zoneid});
    const used=products.reduce((sum,p)=>sum+getTotalQuantity(p.inventory),0);
    await Zone.findByIdAndUpdate(zoneid,{currentcapacity:used})
}