import {Request,Response}from "express"
import UserServices from "../services/UserServices";

class UserController {
    find(req:Request,res:Response){
        UserServices.find(req,res);
    }
}

export default new UserController();