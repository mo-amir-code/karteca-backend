export const JWT_ALGO="shhhhh"
export const COOKIE_AGE_4_DAY=4 * 24 * 60 * 60 * 1000;
export const COOKIE_AGE_15_MIN=15 * 60 * 1000;
export const JWT_AGE_4_DAYS=Math.floor((Date.now()/1000) + (60*60*24*4));
export const JWT_AGE_15_MIN=Math.floor((Date.now()/1000) + (60*15));
export const JWT_CURRENT_DATE=Math.floor(Date.now()/1000)