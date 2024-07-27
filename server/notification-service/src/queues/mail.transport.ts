import { winstonLogger, IEmailLocals } from "gig-globe-helper-library";
import { Logger } from "winston";

import { config } from "@notifications/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "mailTransport",
  "debug"
);

export const sendEmail = async (
  template: string,
  receiverEmail: string,
  locals,
  IEmailLocals
): Promise<void> => {
  try {
    // email templates
    log.info("Email sent successfully");
  } catch (error) {
    log.log(
      "error",
      "NotificationService MailTransport sendEmail() method error:",
      error
    );
  }
};
