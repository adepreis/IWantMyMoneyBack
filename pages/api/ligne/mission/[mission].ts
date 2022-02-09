// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { getConnection } from 'typeorm';
import { RequestError } from '../../../../entity/geneal_struct'
import { IMission, Mission } from '../../../../entity/mission.entity'
import { prepareConnection } from '../../database';

export type MissionRequest = IMission[] | RequestError;

export async function getMission(date:string, userId:string): Promise<IMission[] | null>{
  await prepareConnection();
        const conn = getConnection();
      
        const mission = await conn.getRepository(Mission)
          .createQueryBuilder("mission")
          .leftJoinAndSelect("mission.avances","avance", "avance.userId = :user", {user:userId})
          .leftJoin("mission.service", "service")
          .leftJoin("service.collaborateurAnterieur", "collaborateuranterieur")
          .leftJoin("collaborateuranterieur.collaborateur", "user")
          .where("(mission.dateFin >= :date OR mission.dateFin is null)", {date: date})
          .andWhere("mission.dateDebut <= :date", {date: date})
          .andWhere("user.Id = :user", {user:userId})
          .andWhere("collaborateuranterieur.dateDebut <= :date",{date:date})
          .andWhere("(collaborateuranterieur.dateFin >= :date OR collaborateuranterieur.dateFin is null)", {date:date})
          .getMany();
      console.log(userId)
        conn.close();
        return mission;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MissionRequest>
) {
    var userId;
    try {
        //recupération de la session
        const session = await getSession({ req })
        if (session) {
          userId = (session as any)?.id;
        } else {
          res.status(403).json({error: "acces interdit" as string, code: 403});
        }

        const mission = await getMission(req.query.mission as string, userId);
        if(mission && mission.length > 0){
          res.status(200).json(mission);
        }else{
          throw new Error("aucune mission correspondant");
        }
          

      
    } catch(e) {
        res.status(404).json({error: e as string, code: 404});
    }
}
