import { Channel, ConsumeMessage } from "amqplib";
import { winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";

import { config } from "@notifications/config";
import { createConnection } from "@notifications/queues/connection";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "notificationEmailConsumer",
  "debug"
);

const consumeAuthEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = "gig-globe-email-notification";
    const routingkey = "auth-email";
    const queueName = "auth-email-queue";

    //  Check if the exchange with given name exists
    await channel.assertExchange(exchangeName, "direct");

    //  Check if the queue with given name exists
    const gigGlobeQueue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });

    // Binding the exchange and queue using routing key
    await channel.bindQueue(gigGlobeQueue.queue, exchangeName, routingkey);

    channel.consume(gigGlobeQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));
      // send emails
      // acknowledge
    });
  } catch (error) {
    log.log(
      "error",
      "NotificationService EmailConsumer consumeAuthEmailMessages() method error:",
      error
    );
  }
};

export { consumeAuthEmailMessages };
