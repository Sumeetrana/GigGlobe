import { IAuthPayload, winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";
import cors from "cors";
import { Application, NextFunction, Request, Response } from "express";
import hpp from "hpp";
import helmet from "helmet";

import { config } from "@auth/config";
import { verify } from "jsonwebtoken";

const SERVER_PORT = 4002;
const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "authenticationServer",
  "debug"
);

export const start = (app: Application): void => {
  securityMiddleware(app);
};

const securityMiddleware = (app: Application) => {
  app.set("trust proxy", 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const payload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};
