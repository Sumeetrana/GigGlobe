import { winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";
import { Sequelize } from "sequelize";

import { config } from "@auth/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "authDatabaseServer",
  "debug"
);

export const sequelize = new Sequelize(config.MYSQL_DB!, {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    multipleStatements: true, // Able to run multiple queries
  },
});

export const databaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    log.info(
      "AuthService Mysql database connection has been established successfully"
    );
  } catch (error) {
    log.error("Auth Service - Unable to connect to database.");
    log.log("error", "AuthService databaseConnection() method error:", error);
  }
};
