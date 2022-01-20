import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../entity/geneal_struct";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "../../../entity/lignedefrais.entity";
import { prepareConnection } from "../database";

export type LigneRequest = ILigneDeFrais | RequestError;

export async function getLigne(ligneId: string | null, userId: string): Promise<LigneRequest | null>{
  await prepareConnection();
  const conn = getConnection();

  const ligne = await conn.getRepository(LigneDeFrais)
    .createQueryBuilder("lignedefrais")
    .leftJoinAndSelect("lignedefrais.mission", "mission")
    .leftJoinAndSelect("lignedefrais.note", "notedefrais")
    .where("lignedefrais.id = :id", {id: ligneId})
    .andWhere("userId = :user", {user:userId})
    .getOne();
  
  if(!ligne){
    return null;
  }else{
    return lineToApi(ligne);
  }
  
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
        res.status(403).json({error: "acces interdit" as string, code: 403});
      }

      const ligne = await getLigne(req.query?.ligne as string, userId as string)

      if (!ligne) {
        throw Error;
      }
      res.status(200).json(ligne);
      
  } catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }
  
}