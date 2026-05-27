import express from 'express';
import { logActivity } from '../controllers/activity.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
export const activityRouter=express.Router();

activityRouter.use(express.json());


activityRouter.post('/log',authorize("admin"), logActivity);
