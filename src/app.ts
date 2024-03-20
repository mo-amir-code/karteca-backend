import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routers from "./routers/index.js";
import { connectToMongo } from "./utils/mongoDB.js";
import { errorHandler } from "./middlewares/error.js";
import morgan from "morgan";
import cors from "cors"

const app: Express = express();

const corsOptions = {
    origin: process.env.CLIENT_ORIGIN, 
    credentials: true, // Allow cookies
};

app.use(cookieParser());
connectToMongo();
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routers);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log("server started at port " + process.env.PORT);
});
