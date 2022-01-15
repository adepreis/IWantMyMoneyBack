import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import internal from "stream";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { NoteDeFrais } from "../../entity/notedefrais.entity";
import { prepareConnection } from "./database";
import { Lignes } from "./ligne/[ligne]";

export type Notes = {
    id: string,
    annee:number,
    mois:number,
    etat:string
    ligne:Lignes[]
}
export type NotesRequest = Notes | RequestError


export async function getNote(noteId: string, userId: string): Promise<NotesRequest | null>{
    await prepareConnection();
    const conn = getConnection();
    const note = await conn.getRepository(NoteDeFrais)
        .createQueryBuilder("notedefrais")
        .leftJoinAndSelect("notedefrais.ligne", "lignedefrais")
        .leftJoinAndSelect("lignedefrais.mission", "mission")
        .where("notedefrais.id = :id", {id: noteId})
        .andWhere("userId = :user", {user:userId})
        .getOne(); 

        var lignes:Lignes[] = new Array();
        note?.ligne.forEach(ligne => {
            lignes.push({
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
            });
        });
    if (note == null) {
        return null;
    } else {
        return{
            id: note.id,
            annee: note.annee,
            mois: note.mois,
            etat: note.etat,
            ligne: lignes
        }
    }

}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<NotesRequest>
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

        const note = await getNote(req.query.note, userId)

        if (note ==null) {
          throw Error;
        }
  
        res.status(200).json(note);
        
    } catch(e) {
        res.status(404).json({error: e as string, code: 404});
    }
    
  }