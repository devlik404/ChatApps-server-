import { Request,Response } from "express";
import ValidationService from "../services/ValidationService";

class ValidationController{

    register(req:Request,res:Response){
        ValidationService.create(req,res)
    }
    login(req:Request,res:Response){
        ValidationService.login(req,res)
    }
    check(req:Request,res:Response){
        ValidationService.check(req,res)
    }
}
export default new ValidationController();