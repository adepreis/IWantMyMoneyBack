import {createConnection, getConnection} from "typeorm";
import { User } from "../../entity/user";

export async function getOrCreateConnection() {
    try {
      const conn = getConnection();
      return conn;
    } catch (e) {
      return createConnection({
        type: process.env.TYPEORM_CONNECTION as any,
        host: process.env.TYPEORM_HOST,
        port: parseInt(process.env.TYPEORM_PORT as string) ?? 3306,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        entities: [User],
        synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
        logging: process.env.TYPEORM_LOGGING === "true"
      });
    }
}