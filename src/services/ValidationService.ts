
import { Request, Response } from "express";
import * as bcrypt from 'bcrypt'
import * as jwt from "jsonwebtoken"
import { secretKey } from "../middleware/authenticate";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
    
class ValidationService {
   
    async create(req:Request,res:Response){
        try {
            const {name,phone,email,user_name,password} = req.body;
            const hash = await bcrypt.hash(password, 10)
            const post = await prisma.user.create({
                data: {
               name,
               phone,
               email,
               password:hash,
                },
              })
              res.json(post)
        } catch (error) {
            console.log(error)
            return res.status(500).json("terjadi kesalahan");
        }

    }


    async login(req:Request,res:Response){
    try {
        const data = req.body;
     console.log(data)
        const validation = await prisma.user.findFirst({
         where:{
            email:data.email
         },
        })
        if (!validation) {
            return res.status(401).json("User not found");
        }
        const compareHash =  bcrypt.compare(data.password,validation.password)
        
        if (!compareHash) {
            return res.status(401).json("Invalid password");
        }
        const user = ({
            id:validation.id,
            name:validation.name,
            phone:validation.phone,
            email:validation.email,

        })
        const token = jwt.sign({user}, secretKey, { expiresIn: '1h' });
        return res.status(200).json({
            user:user,
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json("An error occurred");
    }
       
     }

     async check(req:Request,res:Response){
        try {
            const loginSession = res.locals.loginSession;
            console.log(loginSession)

            const user = await prisma.user.findFirst ({
                where:{
                    id:loginSession.user.id
                },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    password: true,
                  },
            })
        
               return res.status(200).json({
                user,
                message:"token valid"
               });
        } catch (error) {
            return res.status(500).json("terjadi kesalahan validasi");
        }

    }
}
export default new ValidationService;