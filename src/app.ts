import express, {Express} from "express";
import cookieParser from "cookie-parser";
import routers from "./routers/index.js";
import { connectToMongo } from "./utils/mongoDB.js";
import { errorHandler } from "./middlewares/error.js";
import helment from "helmet";
import morgan from "morgan";
import cors from "cors"
import { createCategoriesWithImage, createProducts } from "./utils/createProducts.js";

const app: Express = express();

const whitelist = [process.env.CLIENT_ORIGIN]

const corsOptions = {
    origin: function (origin:any, callback:any) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('You are very chalak bro.....'))
        }
      }, 
    credentials: true, // Allow cookies
};

// createProducts(40)
// createCategoriesWithImage();

app.use(helment())
app.use(cookieParser());
connectToMongo();
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routers);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log("server started at port " + process.env.PORT);
});