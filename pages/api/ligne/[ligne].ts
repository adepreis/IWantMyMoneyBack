import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { deleteFile } from ".";
import { RequestError } from "../../../entity/geneal_struct";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "../../../entity/lignedefrais.entity";
import { NOTEDEFRAIS_ETAT } from "../../../entity/utils";
import { prepareConnection } from "../database";

export type LigneRequest = ILigneDeFrais | RequestError | {resultat: string};


//récupère une ligne dans la bd
export async function getLigne(ligneId: string, userId: string): Promise<LigneRequest | null>{
  await prepareConnection();
  const conn = getConnection();

  const ligne = await conn.getRepository(LigneDeFrais)
    .createQueryBuilder("lignedefrais")
    .leftJoinAndSelect("lignedefrais.mission", "mission")
    .leftJoinAndSelect("lignedefrais.note", "notedefrais")
    .where("lignedefrais.id = :id", {id: ligneId})
    .andWhere("userId = :user", {user:userId})
    .getOne();

  conn.close();
  
  if (!ligne) {
    return null;
  } else {
    return lineToApi(ligne);
  }
  
}

//suprime une ligne
export async function rmLigne(ligneId: string, userId: string): Promise<boolean>{
  await prepareConnection();
  var conn = getConnection();

  const ligne = await conn.getRepository(LigneDeFrais)
    .createQueryBuilder("lignedefrais")
    .leftJoinAndSelect("lignedefrais.mission", "mission")
    .leftJoinAndSelect("lignedefrais.note", "notedefrais")
    .where("lignedefrais.id = :id", {id: ligneId})
    .andWhere("userId = :user", {user:userId})
    .getOne();

  conn.close();

  if (!ligne) {
    throw new Error("Ligne inexistante");
  }else if (!(ligne.note.etat === NOTEDEFRAIS_ETAT.BROUILLON || ligne.note.etat === NOTEDEFRAIS_ETAT.REFUSEE)) {
    return false;
  }
  deleteFile(ligne.justificatif)
  await prepareConnection();
  conn = getConnection();
  
  await conn.createQueryBuilder()
  .delete()
  .from(LigneDeFrais)
  .where("id = :id",{id: ligneId})
  .execute();
    
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LigneRequest>
) {
  var userId: string | null = null;
  try {
      //recupération de la session
      const session = await getSession({ req })
      if (session) {
        userId = (session as any)?.id;
      } else {
        res.status(403).json({error: "Accès interdit" as string, code: 403});
      }


      switch (req.method) {
        case "GET":
          const ligne = await getLigne(req.query?.ligne as string, userId as string)

          if (!ligne) {
            throw Error;
          }
          res.status(200).json(ligne);
          break;

        case "DELETE":
          if (await rmLigne(req.query?.ligne as string, userId as string)) {
            res.status(200).json({resultat: "La ligne a bien été supprimée"});
          } else {
            res.status(423).json({error: "Vous ne pouvez pas supprimer cette ligne" as string, code: 423});
          }
          break;
          
        default:
          res.status(424).json({error : "Méthode non prise en charge" as string, code : 424})
          break;
      }

  } catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }
  
}