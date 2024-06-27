import {Redis} from "ioredis";
import { Response } from "express";
import { REDIS_LOCAL_PORT, REDIS_URI } from "../constants.js";


let redisInstance;
try {
    if (REDIS_URI) {
        redisInstance = new Redis(REDIS_URI);
    } else {
        redisInstance = new Redis(REDIS_LOCAL_PORT!);
    }
} catch (error) {
    console.error("Redis Error ===> ", error)
}

redisInstance?.on("connect", () => {
    console.log("Redis database connected.....");
});
    
export const redis = redisInstance;


export const getCachedData = async (key:string, msg:string, res:Response) => {
    try {

        const data = await redis?.get(key);

        if(data){
            return res.status(200).json({
                success: true,
                message: msg,
                data: JSON.parse(data)
            });
        }

        return null;

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: "Internal error occurred!"
        });
    }
}