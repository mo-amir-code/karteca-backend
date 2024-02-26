import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routers from "./routers/index.js";
import { connectToMongo } from "./utils/mongoDB.js";
import { errorHandler } from "./middlewares/error.js";
import morgan from "morgan";
// import {Redis} from "ioredis";
import cors from "cors"

// export const redis = new Redis(process.env.REDIS_URI || "", {maxRetriesPerRequest: null});

const app: Express = express();

connectToMongo();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", routers);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log("server started at port " + process.env.PORT);
});