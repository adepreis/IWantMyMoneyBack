// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getCsrfToken, getSession } from 'next-auth/react';
import { RequestError } from '../../../entity/geneal_struct';

type Retour = {
  name: string
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Retour | RequestError>
) {
    
    var userId: string | null = null;
    const session = await getSession({ req })
    if (session) {
      userId = (session as any)?.id;
    } else {
      res.status(403).json({error: "acces interdit" as string, code: 403});
    }

    switch (req.method) {
      case "POST":
        
        break;

      case "PUT":
        break;
      default:
        res.status(424).json({error : "methode non prise en charge" as string, code : 424})
        break;
    }
  res.status(200).send({"query" : req.body, "methode": req.method, "session": session});
}
