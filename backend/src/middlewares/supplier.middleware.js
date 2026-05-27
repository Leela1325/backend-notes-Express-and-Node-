import express from 'express';
import { fetchSupplierByZoneid } from '../controllers/supplier.controller.js';


export const handleSupplierRoute=(req,res,next)=>{
    if(req.query.zoneid && !req.query.categoryid)
    {
        return fetchSupplierByZoneid(req,res);
        
    }
    else
    {
        next();
    }
}