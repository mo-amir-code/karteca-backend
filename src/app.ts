import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routers from "./routers/index.js";
import { connectToMongo } from "./utils/mongoDB.js";
import { errorHandler } from "./middlewares/error.js";
import morgan from "morgan";

const app: Express = express();

connectToMongo();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", routers);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log("server started at port " + process.env.PORT);
})