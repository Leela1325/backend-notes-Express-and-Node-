import mongoose from 'mongoose'

const zoneSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Zone name is required"],
        trim:true
    },
    maxcapacity:{
        type:Number,
        required:[true,"Max capacity is required"],
        min:[1,"Max capacity must be atleast 1"]
    },
    currentcapacity:{
        type:Number,
        default:0,
        min:[0,"Current capacity cannot be negative"]
    },
    
})
zoneSchema.virtual('availablecapacity').get(function(){
    return this.maxcapacity-this.currentcapacity;
})
zoneSchema.set('toJSON',{virtuals:true,
    toJSON:{
        transform:(doc,ret)=>{
            delete ret._id
        }
    }
})
zoneSchema.set('toObject',{virtuals:true})

const Zone=mongoose.model("Zone",zoneSchema)
export default Zone;