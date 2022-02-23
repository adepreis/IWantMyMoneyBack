import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { INoteDeFrais, NoteDeFrais, noteToApi } from "../../entity/notedefrais.entity";
import { prepareConnection } from "./database";
import { getNote } from "./[note]";

export type HomeNote = {
    notes:INoteDeFrais[],
    annee:number,
}[]
export type HomeNoteRequest = HomeNote | RequestError;

export const getHomeNote = async (session: Session | null) => {
    var userId: string | null = null;
    
    if (session) {
        userId = session?.id as string;
    } else {
        return {error: "Accès interdit" as string, code: 403};
    }

    const year = new Date().getFullYear();
    await prepareConnection();
    const conn = getConnection();
    const notesResRepo = await conn.getRepository(NoteDeFrais)

    var notes: HomeNote[] = [];
    for (let index = -5; index <= 5; index++) {
        var currentyear = year+index;
        const notesResQuery = await notesResRepo
            .createQueryBuilder("notedefrais")
            .where("notedefrais.annee = :annee", {annee: currentyear})
            .andWhere("userId = :user", {user:userId})
            .getMany();

        if (notesResQuery) {
            var notesYear:INoteDeFrais[] = [];
            for (const element of notesResQuery) {
                notesYear.push({...element} as INoteDeFrais);
            }
    
            notes.push(({
                annee: currentyear, 
                notes: notesYear
            }) as any as HomeNote);

        }
    }

    conn.close();

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