import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../entity/geneal_struct";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "../../../entity/lignedefrais.entity";
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

      if(!await getLigne(req.query.ligne[0], userId as string)){
        throw new Error("Ligne inexistante");
      }

      if (req.query.ligne[1]==="delete") {
        await prepareConnection();
        const conn = getConnection();

        await conn.createQueryBuilder()
        .delete()
        .from(LigneDeFrais)
        .where("id = :id",{id: req.query.ligne[0]})
        .execute();

        conn.close();
      }

      res.status(200).send("Ligne suprimer");
      
      
  } catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }
  
}