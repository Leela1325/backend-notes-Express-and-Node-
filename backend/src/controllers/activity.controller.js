import express from 'express';
import mongoose from 'mongoose';
import { Activity } from '../models/activity.model.js';

export const logActivity=async (req,res)=>{
    try{
    const body=req.body;
    await Activity.insertOne(body);
    res.status(201);
    res.json({message:'Successfully added'});
    }
    catch(error)
    {
        res.status(500);
        res.json({message:error.message});
    }
}