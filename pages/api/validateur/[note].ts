import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../../entity/geneal_struct";
import { INoteDeFrais, NoteDeFrais, noteToApi } from "../../../entity/notedefrais.entity";
import { USER_ROLES } from "../../../entity/user.entity";
import { NOTEDEFRAIS_ETAT } from "../../../entity/utils";
import { prepareConnection } from "../database";
import { getService } from "./home";

export type NotesRequest = INoteDeFrais | RequestError | {message: string};

export async function getNote(noteId: string, validateurId: string): Promise<NotesRequest | null>{

    const serviceId = await getService(validateurId);
  if (!serviceId) {
    return null;
  }
  await prepareConnection();
    const conn = getConnection();
    const note = await conn.getRepository(NoteDeFrais)
        .createQueryBuilder("notedefrais")
        .where("notedefrais.id = :noteId",{noteId: noteId})
        .leftJoinAndSelect("notedefrais.lignes", "lignedefrais")
        .leftJoinAndSelect("lignedefrais.mission", "mission")
        .leftJoin("notedefrais.user","user", "user.id != :validateurId", {validateurId:validateurId})
        .leftJoin("user.collaborateurAnterieur","collaborateuranterieur")
        .leftJoin("user.chefsAnterieurs", "chefsanterieurs")
        .andWhere("(collaborateuranterieur.serviceId = :serviceId OR chefsanterieurs.serviceValidateurId = :serviceId)", {serviceId: serviceId})
        .andWhere("(collaborateuranterieur.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR collaborateuranterieur.dateFin is null OR chefsanterieurs.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR chefsanterieurs.dateFin is null)")
        .andWhere("(collaborateuranterieur.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR chefsanterieurs.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01'))")
        .getOne();
        console.log(note)
    conn.close();

    if (!note) {
        return null;
    } else {
        return noteToApi(note);
    }

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<NotesRequest>
  ) {
    var userId: string | null = null;
    try {
        
        //recupération de la session
        const session = await getSession({ req });
        if (!session || (session as any).role != USER_ROLES.CHEF_DE_SERVICE) {
            res.status(403).json({error: "acces interdit" as string, code: 403});
            return;
        } 
        
        const userId = (session as any)?.id;
        switch (req.method) {
            case "GET":
                const note = await getNote(req.query?.note as string, userId as string)

                if (!note) {
                throw Error;
                }
                res.status(200).json(note);
                break;
            
            default:
                res.status(424).json({error : "methode non prise en charge" as string, code : 424})
                break;
        }

  
        
        
    } catch(e) {
        console.log(e);
        res.status(404).json({error: e as string, code: 404});
    }
    
  }