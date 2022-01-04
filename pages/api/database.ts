import {createConnection, getConnection, Connection} from "typeorm";
import { User } from "../../entity/user.entity";

let connectionReadyPromise: Promise<void> | null = null;

export function prepareConnection() {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = getConnection();
        await staleConnection.close();
      } catch (error) {
        // no stale connection to clean up
      }

      // wait for new default connection
      await createConnection({
        type: process.env.TYPEORM_CONNECTION as any,
        host: process.env.TYPEORM_HOST,
        port: parseInt(process.env.TYPEORM_PORT as string) ?? 3306,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        entities: [User],
        synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
        logging: process.env.TYPEORM_LOGGING === "true",
      });
    })();
  }

  return connectionReadyPromise;
}