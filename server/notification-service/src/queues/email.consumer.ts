import { Channel, ConsumeMessage } from "amqplib";
import { IEmailLocals, winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";

import { config } from "@notifications/config";
import { createConnection } from "@notifications/queues/connection";
import { sendEmail } from "@notifications/queues/mail.transport";

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
      const {
        receiverEmail,
        username,
        verifyLink,
        resetLink,
        template,
        sender,
        total,
        serviceFee,
        message,
        type,
        header,
        subject,
        reason,
        newDate,
        originalDate,
        orderUrl,
        requirements,
        orderDue,
        orderId,
        deliveryDays,
        description,
        buyerUsername,
        sellerUsername,
        title,
        offerLink,
        amount,
      } = JSON.parse(msg!.content.toString());

      // send emails
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
        username,
        verifyLink,
        resetLink,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        total,
        serviceFee,
      };
      if (template === "orderPlaced") {
        await sendEmail("orderPlaced", receiverEmail, locals);
        await sendEmail("orderReceipt", receiverEmail, locals);
      } else {
        await sendEmail(template, receiverEmail, locals);
      }
      // acknowledge
      channel.ack(msg!);
    });
  } catch (error) {
    log.log(
      "error",
      "NotificationService EmailConsumer consumeAuthEmailMessages() method error:",
      error
    );
  }
};

const consumeOrderEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = "gig-globe-order-notification";
    const routingkey = "order-email";
    const queueName = "order-email-queue";

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
      const { receiverEmail, username, verifyLink, resetLink, template } =
        JSON.parse(msg!.content.toString());

      // send emails
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: "https://i.ibb.co/Kyp2m0t/cover.png",
        username,
        verifyLink,
        resetLink,
      };
      await sendEmail(template, receiverEmail, locals);

      // acknowledge
      channel.ack(msg!);
    });
  } catch (error) {
    log.log(
      "error",
      "NotificationService EmailConsumer consumeOrderEmailMessages() method error:",
      error
    );
  }
};

export { consumeAuthEmailMessages, consumeOrderEmailMessages };
