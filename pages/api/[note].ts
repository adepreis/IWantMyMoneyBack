import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { INoteDeFrais, NoteDeFrais, noteToApi } from "../../entity/notedefrais.entity";
import { NOTEDEFRAIS_ETAT } from "../../entity/utils";
import { prepareConnection } from "./database";

export type NotesRequest = INoteDeFrais | RequestError | {message: string};

export async function getNote(noteId: string, userId: string): Promise<NotesRequest | null>{

    await prepareConnection();
    const conn = getConnection();
    const note = await conn.getRepository(NoteDeFrais)
        .createQueryBuilder("notedefrais")
        .leftJoinAndSelect("notedefrais.lignes", "lignedefrais")
        .leftJoinAndSelect("lignedefrais.mission", "mission")
        .where("notedefrais.id = :id", {id: noteId})
        .andWhere("userId = :user", {user:userId})
        .getOne();
    conn.close();

    if (!note) {
        return null;
    } else {
        return noteToApi(note);
    }

}

export async function rmNote(noteId: string, userId: string): Promise<boolean>{
    await prepareConnection();
    var conn = getConnection();
  
    const note = await conn.getRepository(NoteDeFrais)
      .createQueryBuilder("notedefrais")
      .where("notedefrais.id = :id", {id: noteId})
      .andWhere("userId = :user", {user:userId})
      .getOne();
  
    conn.close();
  
    if (!note) {
      throw new Error("Note inexistante");
    } else if (!(note.etat === NOTEDEFRAIS_ETAT.BROUILLON || note.etat === NOTEDEFRAIS_ETAT.REFUSEE)) {
      return false;
    }
    await prepareConnection();
  conn = getConnection();
  
  await conn.createQueryBuilder()
  .delete()
  .from(NoteDeFrais)
  .where("id = :id",{id: noteId})
  .execute();
    
  return true;
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<NotesRequest>
  ) {
    var userId: string | null = null;
    try {
        
        //recupération de la session
        const session = await getSession({ req });
        if (session) {
            userId = (session as any)?.id;
        } else {
            res.status(403).json({error: "Accès interdit" as string, code: 403});
        }

        switch (req.method) {
            case "GET":
                const note = await getNote(req.query?.note as string, userId as string)

                if (!note) {
                    throw Error;
                }
                res.status(200).json(note);
                break;
            case "DELETE":
                const rm = await rmNote(req.query?.note as string, userId as string);
                if(rm) {
                    res.status(200).json({message: "Note supprimée"});
                } else {
                    res.status(423).json({error: "Vous ne pouvez pas supprimer cette note" as string, code: 423});
                }
                break;
                    
            default:
                res.status(424).json({error : "Méthode non prise en charge" as string, code : 424})
                break;
        }

  
        
        
    } catch(e) {
        console.log(e);
        res.status(404).json({error: e as string, code: 404});
    }
    
  }