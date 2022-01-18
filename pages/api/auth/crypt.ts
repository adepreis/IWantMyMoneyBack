import { compare, compareSync, genSaltSync, hash, hashSync } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {
    mdp: string,
    res: boolean
  }
  
  export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {

    var salt = genSaltSync(10);
    var hash = hashSync("user", salt);
    var r = compareSync("user","$2b$10$Q6EhSmZ877b98Ak7ltzEsONF7Pbikm0GOXcIzNgrwmiRE8p79BUbG")
    res.status(200).json({ mdp:hash , res: r})
  }
  