import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../../entity/geneal_struct";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "../../../../entity/lignedefrais.entity";
import { NoteDeFrais } from "../../../../entity/notedefrais.entity";
import { USER_ROLES } from "../../../../entity/user.entity";
import { NOTEDEFRAIS_ETAT } from "../../../../entity/utils";
import { prepareConnection } from "../../database";
import { getService } from "../home";

export type LigneRequest = ILigneDeFrais | RequestError;

export async function getLigneValidateur(validateurId:string, ligneId:string):Promise<ILigneDeFrais | undefined> {

  await prepareConnection();
  const conn = getConnection();
  const ligne = await conn.getRepository(LigneDeFrais)
    .createQueryBuilder("lignedefrais")
    .where("lignedefrais.id = :ligneId",{ligneId: ligneId})
    .leftJoinAndSelect("lignedefrais.note","notedefrais")
    .leftJoinAndSelect("notedefrais.user","user", "user.id != :validateurId", {validateurId:validateurId})
    .leftJoinAndSelect("user.collaborateurAnterieur","collaborateuranterieur")
    .leftJoinAndSelect("collaborateuranterieur.service","service")
    .andWhere("collaborateuranterieur.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') ")
    .andWhere("collaborateuranterieur.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') ")
    .leftJoinAndSelect("service.chefsAnterieurs", "chefanterieur", "chefanterieur.chefAnterieurId = :validateurId",{validateurId: validateurId})
    .andWhere("chefanterieur.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR chefanterieur.dateFin is null")
    .andWhere("chefanterieur.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01')")
    .andWhere("chefanterieur.chefAnterieurId = :validateurId",{validateurId: validateurId})
    .getOne();

  conn.close();
  return ligne;
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LigneRequest>
) {
  var userId: string | null = null;
 // try {
      //recupération de la session
      const session = await getSession({ req })

      if (!session || (session as any).role != USER_ROLES.CHEF_DE_SERVICE) {
        res.status(403).json({error: "acces interdit" as string, code: 403});
        return;
      } 
      userId = (session as any)?.id as string;


      switch (req.method) {
        case "GET":
          const ligne = await getLigneValidateur(userId, req.query.ligne as string);
       
          if (!ligne) {
            throw Error;
          }
          res.status(200).json(ligne);
          break;
          
        default:
          res.status(424).json({error : "methode non prise en charge" as string, code : 424})
          break;
      }

      
      
  /*} catch(e) {
      res.status(404).json({error: e as string, code: 404});
  }*/
  
}