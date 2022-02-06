import path from "path/posix";
import {createConnection, getConnection, Connection} from "typeorm";
import { Avance } from "../../entity/avance.entity";
import { ChefAnterieur } from "../../entity/chefanterieur.entity";
import { CollaborateurAnterieur } from "../../entity/collaborateuranterieur.entity";
import { LigneDeFrais } from "../../entity/lignedefrais.entity";
import { Mission } from "../../entity/mission.entity";
import { NoteDeFrais } from "../../entity/notedefrais.entity";
import { Notification } from "../../entity/notification.entity";
import { Service } from "../../entity/service.entity";
import { User } from "../../entity/user.entity";

export async function prepareConnection() {
  // clean up old connection that references outdated hot-reload classes
  try {
    const staleConnection = getConnection();
    await staleConnection.close();
  } catch (error) {
    // no stale connection to clean up
  }

  // wait for new default connection
  //ajouter a entities tout les class typeORM
  await createConnection({
    type: process.env.DB_CONNECTION as any,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string) ?? 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    //ajouter a entities tout les class typeORM
    entities: [Avance, ChefAnterieur, LigneDeFrais, Mission, NoteDeFrais, Notification, Service, User, CollaborateurAnterieur],
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: process.env.DB_LOGGING === "true",
  });
}