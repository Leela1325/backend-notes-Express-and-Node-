import express from 'express'
import cookieParser from'cookie-parser';
import cors from 'cors'
import  Zone  from './models/zone.model.js';
import zoneRouter from './routes/zone.route.js'
import categoryRouter from './routes/category.route.js'
import productRouter from './routes/product.route.js'
import supplierRouter from './routes/supplier.route.js'
import ticketRoutes from './routes/ticket.route.js'
import salesRoutes from './routes/sales.route.js'
import { activityRouter } from './routes/activity.route.js';
import analyticsRouter from './routes/analytics.route.js';
import loginRoute from './routes/login.route.js';
import userRoute from './routes/user.route.js';
import forgotPasswordRoute from './routes/forgotPassword.route.js';
import dashboardRoute from './routes/dashboard.route.js';
import authentication from './middlewares/authentication.middleware.js';
import authorize from './middlewares/authorization.middleware.js';


const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.use(express.static("public"))
app.use(cookieParser())

app.use("/auth", loginRoute);
app.use("/user", userRoute);
app.use("/forgotPassword", forgotPasswordRoute);


app.use(authentication);
app.use("/sales", salesRoutes);
app.use('/categories',categoryRouter)
app.use('/products',productRouter)
app.use('/suppliers',supplierRouter)
app.use('/activity',activityRouter)
app.use('/analytics', analyticsRouter);
app.use("/tickets", ticketRoutes); 
app.use('/zones',zoneRouter)

app.use("/dashboard" ,  dashboardRoute);

export {app}