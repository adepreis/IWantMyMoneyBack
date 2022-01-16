// import 'dotenv/config';
import faker from "@faker-js/faker";
import { getConnection } from "typeorm";
import { prepareConnection } from "../api/database";
import { LigneDeFrais } from "../../entity/lignedefrais.entity";
import { Mission } from "../../entity//mission.entity";
import { NoteDeFrais } from "../../entity//notedefrais.entity";
import { User } from "../../entity/user.entity";
import { NOTEDEFRAIS_ETAT, LIGNE_TYPE } from "../../entity/utils";
import { NextApiRequest, NextApiResponse } from "next";

const USER_ID = "c61b8322-75eb-11ec-b7f5-0242ac120003";
const MISSION_NUMBER = 10;
const LIGNE_NUMBER = 10;
const BEGIN_YEAR = 2018;
const END_YEAR = 2021;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    await prepareConnection();
    const conn = getConnection();

    const userRepo = conn.getRepository(User);
    const user = await userRepo.findOne({
        id: USER_ID
    }) as User;
    
    const missionRepo = conn.getRepository(Mission);

    const missions: Mission[] = [];
    for (let i = 0; i < MISSION_NUMBER; i++) {
        const newMission = missionRepo.create({
            titre: faker.company.companyName(),
            dateDebut: faker.date.soon(),
            dateFin: faker.date.future(),
            description: faker.company.catchPhraseDescriptor()
        })

        missions.push(newMission);
    }

    await conn.createQueryBuilder()
        .insert()
        .into(Mission)
        .values(missions)
        .execute();

    const noteRepo = conn.getRepository(NoteDeFrais);
    
    var notes = [];
    for (let year = BEGIN_YEAR; year <= END_YEAR; year++) {
        for (let month = 0; month < 12; month++) {
            if (Math.random() > 0.8) continue;
    
            const newNote = noteRepo.create({
                annee: year,
                mois: month,
                etat: Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.VALIDEE :
                    Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.REFUSEE :
                    Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.NON_VALIDEE :
                    NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION,
                user: user
            })

            notes.push(newNote);
        }
    }

    await conn.createQueryBuilder()
        .insert()
        .into(NoteDeFrais)
        .values(notes)
        .execute();

    const ligneRepo = conn.getRepository(LigneDeFrais);

    const lignes: LigneDeFrais[] = [];
    for (const note of notes) {
        if (Math.random() > 0.8) continue;
    
        for (const mission of missions) {
            if (Math.random() < 0.7) continue;

            for (let i = 0; i < LIGNE_NUMBER; i++) {
                await conn.createQueryBuilder()
                    .insert()
                    .into(LigneDeFrais)
                    .values([
                        {
                            avance: false,
                            titre: faker.commerce.product(),
                            date: faker.date.soon(),
                            validee: 0,
                            prixHT: faker.datatype.number(),
                            prixTTC: faker.datatype.number(),
                            prixTVA: faker.datatype.number(),
                            justificatif: "toto.png",
                            perdu: false,
                            raison_avance: "",
                            type: Math.random() > 0.5 ? LIGNE_TYPE.LOGEMENT :
                                Math.random() > 0.5 ? LIGNE_TYPE.DEPLACEMENT :
                                Math.random() > 0.5 ? LIGNE_TYPE.EVENEMENT_PROFESSIONNEL :
                                Math.random() > 0.5 ? LIGNE_TYPE.REPAS :
                                LIGNE_TYPE.AUTRE,
                            note: note,
                            mission: mission
                        }
                    ])
                    .execute();
            }
        }
    }


    res.status(200).json({done: ":)"})
}