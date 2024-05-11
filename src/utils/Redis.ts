import {Redis} from "ioredis";


let redisInstance;

if (process.env.REDIS_URI) {
    redisInstance = new Redis(process.env.REDIS_URI);
} else {
    redisInstance = new Redis(6379);
}

export const redis = redisInstance;