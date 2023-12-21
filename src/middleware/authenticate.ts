import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export const secretKey = "secret-key";

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const token = authorizationHeader.split(" ")[1];
  try {
    const loginSession = jwt.verify(token, secretKey);
    res.locals.loginSession = loginSession;
    next();
  } catch (error) {
    return res.status(401).json({ error: "unauthorized both" });
  }
};
export default authenticate;