import {
  Application,
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import {
  winstonLogger,
  IErrorResponse,
  CustomError,
} from "gig-globe-helper-library";
import { Logger } from "winston";
import cookieSession from "cookie-session";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { StatusCodes } from "http-status-codes";

const SERVER_PORT = 4000;
const log: Logger = winstonLogger("", "apiGatewayServer", "debug");

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler();
  }

  private securityMiddleware(app: Application): void {
    app.set("trust proxy", 1);
    app.use(
      cookieSession({
        name: "session",
        keys: [],
        maxAge: 24 * 7 * 3600000,
        secure: false, // Update with value from config
        // sameSite: none
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: "",
        credentials: true, // Attach token to every request that comes from the client
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: "200mb" }));
    app.use(urlencoded({ extended: true, limit: "200mb" }));
  }

  private routesMiddleware(app: Application): void {}

  private startElasticSearch(): void {}

  private errorHandler(): void {
    this.app.use("*", (req: Request, res: Response, next: NextFunction) => {
      const fullURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`; // Get the full URl from request object
      log.log("error", `${fullURL} endpoint does not exist.`, "");
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "The endpoint called does not exist" });
      next();
    });

    this.app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.log("error", `GatewayService ${error.comingFrom}:`, error);
        if (error instanceof CustomError) {
          res.status(error.statusCode).json(error.serializeErrors);
        }
        next();
      }
    );
  }
}
