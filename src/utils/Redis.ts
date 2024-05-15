import {Redis} from "ioredis";


let redisInstance;
try {
    if (process.env.REDIS_URI) {
        redisInstance = new Redis(process.env.REDIS_URI);
    } else {
        redisInstance = new Redis(process.env.REDIS_LOCAL_PORT!);
    }
} catch (error) {
    console.error("Redis Error ===> ", error)
}
    
export const redis = redisInstance;