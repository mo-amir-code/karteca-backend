import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routers from "./routers/index.js";
import { connectToMongo } from "./services/mongoDB.js";

const app: Express = express();

// connectToMongo();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", routers);

app.listen(process.env.PORT, () => {
    console.log("server started at port " + process.env.PORT);
})