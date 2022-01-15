import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../entity/geneal_struct";
import { LigneDeFrais } from "../../../entity/lignedefrais.entity";
import { prepareConnection } from "../database";

export type Lignes = {
  id: string,
  titre: string,
  mission: Mission,
  date: Date,
  validee: number,
  prixHT: number,
  prixTTC: number,
  prixTVA: number,
  avance: boolean,
  raison_avance: string,
  type: string,
} | RequestError

export type Mission = {
  id: string,
  titre: string,
  dateDebMission: Date,
  dateFinMission: Date,
  descriptionMission: string,
}

export async function getLigne(ligneId: string, userId: string): Promise<Lignes | null>{
  await prepareConnection();
  const conn = getConnection();

  const ligne = await conn.getRepository(LigneDeFrais)
  .createQueryBuilder("lignedefrais")
  .leftJoinAndSelect("lignedefrais.mission", "mission")
  .leftJoinAndSelect("lignedefrais.note", "notedefrais")
  .where("lignedefrais.id = :id", {id: ligneId})
  .andWhere("userId = :user", {user:userId})
  .getOne();
  
  if(ligne == null){
    return null;
  }else{
    return {
      id: ligne.id,
      titre: ligne.titre, 
      mission: ligne.mission,
      date: ligne.date,
      validee: ligne.validee,
      prixHT: ligne.prixHT,
      prixTTC: ligne.prixTTC,
      prixTVA: ligne.prixTVA,
      avance: ligne.avance,
      raison_avance: ligne.raison_avance,
      type: ligne.type
    };
  }
  
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Lignes>
) {
  var userId = null;
  try {
      //recupération de la session
      const session = await getSession({ req })
      if (session) {
        userId = session.user?.email?.id;
      } else {
          res.status(403).json({error: "acces interdit" as string, code: 403});
      }

      const ligne = await getLigne(req.query.ligne, userId)
  
      if (ligne == null) {
        throw Error;
      }
      res.status(200).json(ligne);
      
  } catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }
  
}