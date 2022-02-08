import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { getConnection } from 'typeorm';
import { RequestError } from '../../../entity/geneal_struct'
import { INoteDeFrais, NoteDeFrais, noteToApi } from '../../../entity/notedefrais.entity';
import { User } from '../../../entity/user.entity';
import { LIGNEDEFRAIS_ETAT, NOTEDEFRAIS_ETAT } from '../../../entity/utils';
import { prepareConnection } from '../database';
import { getNote, NotesRequest } from '../[note]';
import { getService } from './home';
import { getNoteValidateur } from './[note]';

export type CreateNoteRequest = {
  idNote: string
} | RequestError | {resultat: string}

//refuse une note
export async function refuserNote(noteid: string, note: INoteDeFrais): Promise<boolean> {
  for (const ligne of note.lignes) {;
      if (ligne.etat != LIGNEDEFRAIS_ETAT.VALIDEE && ligne.etat != LIGNEDEFRAIS_ETAT.REFUSEE) {
        return false;
      }
  }
  await prepareConnection();
  const conn = await getConnection();
  const ligne = await conn.createQueryBuilder()
  .update(NoteDeFrais)
  .set(
    { 
      etat: NOTEDEFRAIS_ETAT.REFUSEE
    }
  )
  .where("id = :id", {id: noteid})
  .execute();
  conn.close();

  return ligne.affected == 0 ? false : true;
}

//valide une note
export async function validerNote(noteid: string, note: INoteDeFrais): Promise<boolean> {
  for (const ligne of note.lignes) {;
      if (ligne.etat != LIGNEDEFRAIS_ETAT.VALIDEE) {
        return false;
      }
  }
  await prepareConnection();
  const conn = await getConnection();
  const ligne = await conn.createQueryBuilder()
  .update(NoteDeFrais)
  .set(
    { 
      etat: NOTEDEFRAIS_ETAT.VALIDEE
    }
  )
  .where("id = :id", {id: noteid})
  .execute();
  conn.close();

  return ligne.affected == 0 ? false : true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateNoteRequest>
) {
    var user: User | null = null;
    //recupération de la session
    const session = await getSession({ req })
    if (!session) {
        res.status(403).json({error: "Accès interdit" as string, code: 403});
    } else {
      switch (req.method) {
        case "PUT":
          //todo
          const notes = await getNoteValidateur(req.body.id, session.id as string);
          if (!notes) {
            res.status(404).json({error: "La note est inexistante", code: 404});
            return;
          }

          const note = notes as unknown as INoteDeFrais;
          if (!(note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION)) {
            res.status(423).json({error: "Vous ne pouvez pas soumettre cette note", code: 423});
            return;
          } else {
            switch (req.body.etat) {
              case "VALIDEE":
                if (await validerNote(req.body.id,note)) {
                  res.status(200).json({resultat : "notes validée"});
                } else {
                  res.status(400).json({error : "Vous devez valider toutes les lignes pour pouvoir valider la note", code : 400})
                }
                break;

                case "REFUSEE":
                  if (await refuserNote(req.body.id,note)) {
                    res.status(200).json({resultat : "notes refuséee"});
                  } else {
                    res.status(400).json({error : "Vous devez valider ou refuser toutes les lignes pour pouvoir refuser la note", code : 400})
                  }
                  break;
              default:
                res.status(404).json({error: "Action non trouvée", code: 404});
                break;
            }

          }
          break;

        default:
          res.status(424).json({error : "Méthode non prise en charge" as string, code : 424})
          break;
      }

    }
}
