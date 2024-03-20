import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/user.js";

export const errorHandler = (err:ErrorHandler, req:Request, res:Response) => {
    err.message ||= "Internal Error Occurred!";
    err.statusCode ||= 500;

    res.setHeader('Content-Type', 'application/json');

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}


export const TryCatch = (func:ControllerType) => (req:Request, res:Response, next:NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
}