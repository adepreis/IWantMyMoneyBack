import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import internal from "stream";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { LigneDeFrais } from "../../entity/lignedefrais.entity";
import { INoteDeFrais, NoteDeFrais, noteToApi } from "../../entity/notedefrais.entity";
import { prepareConnection } from "./database";
import { LigneRequest } from "./ligne/[ligne]";

export type NotesRequest = INoteDeFrais | RequestError

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
        if (session) {
            userId = (session as any)?.id;
        } else {
            res.status(403).json({error: "acces interdit" as string, code: 403});
        }

        const note = await getNote(req.query?.note as string, userId as string)

        if (!note) {
          throw Error;
        }
  
        res.status(200).json(note);
        
    } catch(e) {
        res.status(404).json({error: e as string, code: 404});
    }
    
  }