import { ReferLevelUser } from "../models/ReferralLevel.js";

export interface ReferralLevelType{
    level: number,
    users: ReferLevelUser
}