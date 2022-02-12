// import 'dotenv/config';
import faker from "@faker-js/faker";
import { getConnection } from "typeorm";
import { prepareConnection } from "../api/database";
import { LigneDeFrais } from "../../entity/lignedefrais.entity";
import { Mission } from "../../entity//mission.entity";
import { NoteDeFrais } from "../../entity//notedefrais.entity";
import { User, USER_ROLES } from "../../entity/user.entity";
import { NOTEDEFRAIS_ETAT, LIGNE_TYPE, LIGNEDEFRAIS_ETAT } from "../../entity/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { genSaltSync, hashSync } from "bcrypt";
import { Service } from "../../entity/service.entity";
import { CollaborateurAnterieur } from "../../entity/collaborateuranterieur.entity";
import { ChefAnterieur } from "../../entity/chefanterieur.entity";
import { Notification } from "../../entity/notification.entity";
import { insertNote } from ".";
import { Avance } from "../../entity/avance.entity";

var USER_ID = "0";
const MISSION_NUMBER = 3;
const LIGNE_NUMBER = 5;
const BEGIN_YEAR = 2018;
const END_YEAR = 2023;
const USER_NUMBER = 5;
const SERVICE_NUMBER = 2;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    await prepareConnection();
    const conn = getConnection();

    const s = await conn.createQueryBuilder()
        .insert()
        .into(Service)
        .values([
            {
                nom: "Ressource Humaine"
            },
            {
                nom: "Informatique"
            }
        ])
        .execute();
    var service = [] as Service[];
    for (let index = 0; index < s.identifiers.length; index++) {
        service.push(
            await conn.getRepository(Service)
                .findOne({
                    id: s.identifiers[index].id
                }) as Service);
    }
    for (let index = 0; index < USER_NUMBER; index++) {

        const prenom = faker.name.firstName();
        const nom = faker.name.lastName();
        const salt = genSaltSync(10);
        const r = await conn.createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {
                    password: hashSync(prenom, salt),
                    email: (prenom + "." + nom + "@iwantmymoneyback.com").toLowerCase(),
                    nom: nom,
                    prenom: prenom,
                    role: index < SERVICE_NUMBER ? USER_ROLES.CHEF_DE_SERVICE : USER_ROLES.USER
                }
            ])
            .execute();
        USER_ID = r.identifiers[0].id;

        const userRepo = conn.getRepository(User);
        const user = await userRepo.findOne({
            id: USER_ID
        }) as User;

        await conn.createQueryBuilder()
            .insert()
            .into(CollaborateurAnterieur)
            .values([
                {
                    dateDebut: faker.date.past(faker.datatype.number({ min: 0, max: 5, precision: 1 })),
                    collaborateur: user,
                    service: service[index % SERVICE_NUMBER]
                }
            ])
            .execute();

        if (index < SERVICE_NUMBER) {
            await conn.createQueryBuilder()
                .insert()
                .into(ChefAnterieur)
                .values([
                    {
                        dateDebut: faker.date.past(faker.datatype.number({ min: 0, max: 5, precision: 1 })),
                        chefAnterieur: user,
                        service: service[index % SERVICE_NUMBER],
                        serviceValidateur: service[(index + 1) % SERVICE_NUMBER]
                    }
                ])
                .execute();
        }

        const missionRepo = conn.getRepository(Mission);

        const missions: Mission[] = [];
        for (let i = 0; i < MISSION_NUMBER; i++) {
            const newMission = missionRepo.create({
                titre: faker.company.companyName(),
                dateDebut:faker.date.past(),
                dateFin: faker.date.future(),
                description: faker.company.catchPhraseDescriptor(),
                service: service[index % SERVICE_NUMBER]
            })
            
            missions.push(newMission);
        }

        await conn.createQueryBuilder()
            .insert()
            .into(Mission)
            .values(missions)
            .execute();

        const noteRepo = conn.getRepository(NoteDeFrais);

        for(const mission of missions){
            //creation avance
            if (Math.random() > 0.8) {
                await conn.createQueryBuilder()
                    .insert()
                    .into(Avance)
                    .values({
                        montant:faker.datatype.number({ min: 100, max: 10000, precision: 0.01 }),
                        rembourse:faker.datatype.number({ min: 0, max: 1500, precision: 0.01 }),
                        mission:mission,
                        user:user
                    })
                    .execute();

            }
        }

        var notes = [];
        for (let year = BEGIN_YEAR; year <= END_YEAR; year++) {
            for (let month = 0; month < 12; month++) {
                if (Math.random() > 0.8) continue;
                const etat = Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.VALIDEE :
                Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.REFUSEE :
                    Math.random() > 0.5 ? NOTEDEFRAIS_ETAT.BROUILLON :
                        NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION;

                const newNote = noteRepo.create({
                    annee: year,
                    mois: month,
                    etat: etat,
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
            if ((note.etat == NOTEDEFRAIS_ETAT.VALIDEE || note.etat == NOTEDEFRAIS_ETAT.REFUSEE) && Math.random()>0.9) {
                await conn.createQueryBuilder()
                .insert()
                .into(Notification)
                .values({
                    description: "La note a été "+note.etat.toLocaleLowerCase(),
                    lu:Math.random()>0.5,
                    date: faker.date.past(),
                    user:user,
                    note:note
                })
                .execute();
            }
            for (const mission of missions) {
                if (Math.random() < 0.7) continue;

                
                for (let i = 0; i < LIGNE_NUMBER; i++) {
                    const realFiles = ["https://picsum.photos/seed/picsum/800/300.jpg", "http://www.africau.edu/images/default/sample.pdf"];
                    const wrongFiles = ["", "toto.gif"];

                    const ht = faker.datatype.number({ min: 100, max: 1500, precision: 0.01 });
                    const tva = faker.datatype.number({ min: 5, max: 30, precision: 1 });

                    await conn.createQueryBuilder()
                        .insert()
                        .into(LigneDeFrais)
                        .values([
                            {
                                avance: false,
                                titre: faker.commerce.product(),
                                date: faker.date.between(mission.dateDebut.toDateString(),mission.dateFin.toDateString()),
                                etat: Math.random() > 0.5 ? LIGNEDEFRAIS_ETAT.VALIDEE :
                                    Math.random() > 0.5 ? LIGNEDEFRAIS_ETAT.REFUSEE :
                                        LIGNEDEFRAIS_ETAT.BROUILLON,
                                prixHT: ht,
                                prixTTC: ht + tva,
                                prixTVA: tva,
                                justificatif: Math.random() > 0.5 ? realFiles[Math.floor(Math.random() * realFiles.length)] : realFiles.concat(wrongFiles)[Math.floor(Math.random() * (realFiles.length + wrongFiles.length))],
                                perdu: false,
                                type: Math.random() > 0.5 ? LIGNE_TYPE.LOGEMENT :
                                    Math.random() > 0.5 ? LIGNE_TYPE.DEPLACEMENT :
                                        Math.random() > 0.5 ? LIGNE_TYPE.EVENEMENT_PROFESSIONNEL :
                                            Math.random() > 0.5 ? LIGNE_TYPE.REPAS :
                                                LIGNE_TYPE.AUTRE,
                                note: note,
                                mission: mission,
                                commentaire: "",
                                commentaire_validateur: ""
                            }
                        ])
                        .execute();
                }
            }
        }
    }
    conn.close();
    res.status(200).json({ done: ":)" })
}
