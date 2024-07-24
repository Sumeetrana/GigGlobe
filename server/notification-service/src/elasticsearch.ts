import { Client } from "@elastic/elasticsearch";
import { Logger } from "winston";
import { winstonLogger } from "gig-globe-helper-library";

import { config } from "./config";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "notificationElasticSearchServer",
  "debug"
);

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`,
});

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    try {
      // To check if the elasticsearch is running
      const health: ClusterHealthResponse =
        await elasticSearchClient.cluster.health({});
      log.info(
        `NotificationService Elasticsearch health status - ${health.status}`
      );
      isConnected = true;
    } catch (error) {
      log.error("Connection to Elasticsearch failed. Retrying...");
      log.log("error", "NotificationService checkConnection() method:", error);
    }
  }
}
