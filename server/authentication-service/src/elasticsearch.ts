import { Client } from "@elastic/elasticsearch";
import { Logger } from "winston";
import { winstonLogger } from "gig-globe-helper-library";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

import { config } from "@auth/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "authElasticSearchServer",
  "debug"
);

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`,
});

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    log.info("AuthService connection to ElasticSearch...");
    try {
      // To check if the elasticsearch is running
      const health: ClusterHealthResponse =
        await elasticSearchClient.cluster.health({});
      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error("Connection to Elasticsearch failed. Retrying...");
      log.log("error", "AuthService checkConnection() method:", error);
    }
  }
}
