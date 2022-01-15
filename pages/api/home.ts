import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { NoteDeFrais } from "../../entity/notedefrais.entity";
import { prepareConnection } from "./database";
import { getNote, Notes } from "./[note]";

export type HomeNote = {
    annee:number,
    notes:Notes[]
}[]
export type HomeNoteRequest = HomeNote | RequestError;

export const getHomeNote = async (session: Session | null) => {
    var userId: string | null = null;
    
    if (session) {
        userId = session.user?.email?.id;
    } else {
        return {error: "acces interdit" as string, code: 403};
    }
    const year = new Date().getFullYear();
    await prepareConnection();
    const conn = getConnection();

    var notes:{
        annee:number,
        notes:Notes[]
    }[] = new Array();
    for (let index = -5; index <= 5; index++) {
        var currentyear = year+index;
        const notesResQuery = await conn.getRepository(NoteDeFrais)
        .createQueryBuilder("notedefrais")
        .where("notedefrais.annee = :annee", {annee: currentyear})
        .andWhere("userId = :user", {user:userId})
        .getMany();
        
        var notesYear:Notes[] = new Array();
        notesResQuery.forEach(async element => {
            const note = await getNote(element.id, userId);
            if(note != null){
                notesYear.push(note);
            }
        });
        
        notes.push({annee: currentyear, notes: notesYear});
    }

    return notes;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HomeNoteRequest>
) {
    //recupération de la session
    const session = await getSession({ req })

    try {
        const data = await getHomeNote(session);

        if ((data as RequestError)?.code) {
            const error = data as RequestError;
            res.status(error.code).json(error);
        }
        else {
            res.status(200).json(data as HomeNoteRequest);
        }
    } catch(e) {
        console.log(e);
        res.status(404).json({error: e as string, code: 404});
    }
    
}