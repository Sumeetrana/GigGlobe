import { winstonLogger } from "gig-globe-helper-library";
import { Logger } from "winston";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

import { config } from "@gateway/config";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "apiGatewayServer",
  "debug"
);

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`,
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      log.info("GatewayService connection to ElasticSearch");
      try {
        const health: ClusterHealthResponse =
          await this.elasticSearchClient.cluster.health({});
        log.info(
          `GatewayService ElasticSearch health status - ${health.status}`
        );
        isConnected = true;
      } catch (error) {
        log.error("Connection to ElasticSearch Failed, retrying...");
        log.log(
          "error",
          "GatewayService checkConnection() method error: ",
          error
        );
      }
    }
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();
