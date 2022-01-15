import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getConnection } from "typeorm";
import { RequestError } from "../../entity/geneal_struct";
import { NoteDeFrais } from "../../entity/notedefrais.entity";
import { prepareConnection } from "./database";
import { getNote, Notes } from "./[note]";


export type HomeNote = {
   data: {
        annee:number,
        notes:Notes[]
    }[]
} | RequestError

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HomeNote>
) {
    const { toto } = req.query
    var userId = null;
    try {
        
        //recupération de la session
        const session = await getSession({ req })
        
        if (session) {
            userId = session.user?.email?.id;
        } else {
            res.status(403).json({error: "acces interdit" as string, maSuperVariableAjoute: 403});
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


        res.status(200).json({data: notes});
        
    } catch(e) {
        res.status(404).json({error: e as string, maSuperVariableAjoute: 404});
    }
    
}