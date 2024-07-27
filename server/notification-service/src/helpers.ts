import { IEmailLocals, winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import Email from "email-templates";

import { config } from "@notifications/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "notificationElasticSearchServer",
  "debug"
);

const emailTemplates = async (
  template: string,
  receiver: string,
  locals: IEmailLocals
): Promise<void> => {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD,
      },
    });

    const email: Email = new Email({
      message: {
        from: `GigGlobe App <${config.SENDER_EMAIL}>`,
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: "ejs",
        },
      },
      juice: true, // To be able to use inline css styles in templates
      juiceResources: {
        preserveImportant: true, // Css properties like '!important'
        webResources: {
          relativeTo: path.join(__dirname, "../build"), // In production, resources will be in build folder
        },
      },
    });

    await email.send({
      template: path.join(__dirname, "..", "src/emails", template),
      message: {
        to: receiver,
      },
      locals,
    });
  } catch (error) {
    log.error(error);
  }
};

export { emailTemplates };
