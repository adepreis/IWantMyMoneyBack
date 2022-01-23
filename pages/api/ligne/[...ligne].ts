import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../entity/geneal_struct";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "../../../entity/lignedefrais.entity";
import { NOTEDEFRAIS_ETAT } from "../../../entity/utils";
import { prepareConnection } from "../database";
import { getLigne, LigneRequest } from "./[ligne]";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RequestError | string>
) {
  var userId: string | null = null;
  try {
      //recupération de la session
      const session = await getSession({ req })
      if (session) {
        userId = (session as any)?.id;
      } else {
        res.status(403).json({error: "acces interdit" as string, code: 403});
      }


      await prepareConnection();
      const conn = getConnection();

      const ligne = await conn.getRepository(LigneDeFrais)
        .createQueryBuilder("lignedefrais")
        .leftJoinAndSelect("lignedefrais.mission", "mission")
        .leftJoinAndSelect("lignedefrais.note", "notedefrais")
        .where("lignedefrais.id = :id", {id: req.query.ligne[0]})
        .andWhere("userId = :user", {user:userId})
        .getOne();

      conn.close();

      if(!ligne){
        throw new Error("Ligne inexistante");
      }else if (!(ligne.note.etat === NOTEDEFRAIS_ETAT.NON_VALIDEE || ligne.note.etat === NOTEDEFRAIS_ETAT.REFUSEE)) {
        res.status(423).json({error: "acces interdit" as string, code: 423});
      }

      switch (req.query.ligne[1]) {
        case "delete":
          await prepareConnection();
          const conn = getConnection();

          await conn.createQueryBuilder()
          .delete()
          .from(LigneDeFrais)
          .where("id = :id",{id: req.query.ligne[0]})
          .execute();

          conn.close();

          res.status(200).send("Ligne suprimer");
          break;

        case "update":



          res.status(200).send("Ligne mise à jour");
          break;
        default:
          break;
      }

      res.status(200).send("Ligne mise à jour");
      
      
  } catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }
  
}