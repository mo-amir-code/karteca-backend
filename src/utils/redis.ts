import {Redis} from "ioredis";

const redis = new Redis(process.env.REDIS_URI || "", {maxRetriesPerRequest: null});

export default redis;