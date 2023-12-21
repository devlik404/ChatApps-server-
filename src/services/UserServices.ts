import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

class UserServices {
  async find(req: Request, res: Response) {
    const loginSession = res.locals.loginSession;

    const response = await prisma.user.findMany({
      where: {
        id: {
          not: loginSession.user.id,
        },
      },
    });

    return res.status(200).json(response);
  }
}

export default new UserServices();
