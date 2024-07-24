import client, { Channel, Connection } from "amqplib";
import { winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";

import { config } from "@notifications/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "notificationQueueConnection",
  "debug"
);

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(
      `${config.RABBITMQ_ENDPOINT}`
    );
    const channel: Channel = await connection.createChannel();
    log.info(`Notification server connected to queue successfully...`);
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log(
      "error",
      "NotificationService createConnection() queue method",
      error
    );
    return undefined;
  }
}

// Whenever Signal Interruption error occurs, then we will simply close the connection
function closeConnection(channel: Channel, connection: Connection): void {
  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });
}
