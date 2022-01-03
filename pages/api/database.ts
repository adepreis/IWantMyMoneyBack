import {createConnection, getConnection} from "typeorm";
import { User } from "../../entity/user";

export async function getOrCreateConnection() {
    try {
      const conn = getConnection();
      return conn;
    } catch (e) {
      return createConnection({
        type: "mariadb",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT as string) ?? 3306,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DB,
        entities: [User],
        synchronize: true,
        logging: false
      });
    }
}