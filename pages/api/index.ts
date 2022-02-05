import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { getConnection } from 'typeorm';
import { RequestError } from '../../entity/geneal_struct'
import { NoteDeFrais } from '../../entity/notedefrais.entity';
import { User } from '../../entity/user.entity';
import { prepareConnection } from './database';

export type CreateNoteRequest = {
  idNote: string
} | RequestError

export async function insertNote(data: NoteDeFrais, userId: User):Promise<string | undefined> {
    await prepareConnection();
    const conn = await getConnection();
    try {

      const note = await conn.createQueryBuilder()
      .insert()
      .into(NoteDeFrais)
      .values([
        { 
          mois: data.mois,
          annee: data.annee,
          user: userId
        }
      ])
      .execute();
      conn.close();
      return note.identifiers[0].id;
      
    } catch (error) {
      return;    
    }
      
  }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateNoteRequest>
) {
    if (req.method != "POST") {
        res.status(424).json({error : "methode non prise en charge" as string, code : 424})
        return;
    }

    var user: User | null = null;
    //recupération de la session
    const session = await getSession({ req })
    if (!session) {
        res.status(403).json({error: "acces interdit" as string, code: 403});
    } else {
    
        user = (session as any);
        const idNote = await insertNote(req.body, user as User);
        if(idNote){
            res.status(200).send({idNote : idNote});
        }else{
            res.status(400).json({error : "Les donnée envoyé ne sont pas valide ou complète", code : 400})
        }
    }
}
