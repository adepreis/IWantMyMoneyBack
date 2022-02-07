// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { getConnection } from 'typeorm';
import { RequestError } from '../../../entity/geneal_struct';
import { INoteDeFrais, NoteDeFrais } from '../../../entity/notedefrais.entity';
import { Service } from '../../../entity/service.entity';
import { User, USER_ROLES } from '../../../entity/user.entity';
import { prepareConnection } from '../database';

export type RequestNote = INoteDeFrais[] | RequestError;

export async function getService(userId:string):Promise<string | null> {
  await prepareConnection();
    const conn = getConnection();
    const service = await conn.getRepository(Service)
        .createQueryBuilder("service")
        .select("service.id")
        .leftJoin("service.chefsAnterieurs","chefanterieur")
        .where("chefanterieur.chefAnterieurId = :userId", {userId:userId})
        .andWhere("chefanterieur.datefin is null")
        .getOne();
    conn.close();

  return service? service.id : null;
}


export async function getValidateur(validateurId:string):Promise<INoteDeFrais[] | null> {
  const serviceId = await getService(validateurId);
  if (!serviceId) {
    return null;
  }
  await prepareConnection();
    const conn = getConnection();
    const notes = await conn.getRepository(NoteDeFrais)
        .createQueryBuilder("notedefrais")
        .leftJoinAndSelect("notedefrais.user","user", "user.id != :validateurId", {validateurId:validateurId})
        .leftJoin("user.collaborateurAnterieur","collaborateuranterieur")
        .leftJoin("user.chefsAnterieurs", "chefsanterieurs")
        .andWhere("collaborateuranterieur.serviceId = :serviceId OR chefsanterieurs.serviceValidateurId = :serviceId", {serviceId: serviceId})
        .andWhere("collaborateuranterieur.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR collaborateuranterieur.dateFin is null OR chefsanterieurs.dateFin >= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR chefsanterieurs.dateFin is null")
        .andWhere("collaborateuranterieur.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01') OR chefsanterieurs.dateDebut <= CONCAT(notedefrais.annee, '-', notedefrais.mois, '-', '01')")
        .getMany();
    conn.close();
  return notes;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RequestNote>
) {
  //recupération de la session
  const session = await getSession({ req });
  if (!session || (session as any).role != USER_ROLES.CHEF_DE_SERVICE) {
    res.status(403).json({error: "acces interdit" as string, code: 403});
    return;
  } 

  const userId = (session as any)?.id;
  const notes = await getValidateur(userId);

  if (notes) {
    res.status(200).json(notes)
  }else{
    res.status(404).json({error: "aucune notes trouvé", code: 404});
  }
  
}
