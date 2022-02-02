// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { getConnection } from 'typeorm';
import { RequestError } from '../../../../entity/geneal_struct'
import { IMission, Mission } from '../../../../entity/mission.entity'
import { prepareConnection } from '../../database';



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Mission | RequestError>
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

        
        await prepareConnection();
        const conn = getConnection();
      
        const ligne = await conn.getRepository(Mission)
          .createQueryBuilder("mission")
          .leftJoinAndSelect("mission.service", "service")
          .leftJoinAndSelect("service.user", "service")
          .andWhere("userId = :user", {user:userId})
          .where("mission.dateDebut <= :date", {date: req.query.mission})
          .andWhere("mission.dateFin >= :date", {date: req.query.mission})
          .getMany();
      
        conn.close();
        
        
    } catch(e) {
        res.status(404).json({error: e as string, code: 404});
    }
}
