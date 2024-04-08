import { ReferLevelUser } from "../models/ReferralLevel.js";

export interface ReferralLevelType{
    level: number,
    users: ReferLevelUser
}

export interface LevelEarningType{
    level:number,
    withdrawalDisabledUsers: number,
    withdrawalEnabledUsers: number,
    earning: number
}