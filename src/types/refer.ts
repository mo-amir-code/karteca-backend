import { ReferLevelUser } from "../models/ReferralLevel.js";

export interface ReferralLevelType{
    level: number,
    users: ReferLevelUser
}

export interface LevelEarningType{
    level:number,
    totalConnectionsPerLevel: number,
    withdrawalEnabledUsers: number,
    earning: number
}