// import 'dotenv/config';
import faker from "@faker-js/faker";
import { getConnection } from "typeorm";
import { prepareConnection } from "../api/database";
import { LigneDeFrais } from "../../entity/lignedefrais.entity";
import { Mission } from "../../entity//mission.entity";
import { NoteDeFrais } from "../../entity//notedefrais.entity";
import { User } from "../../entity/user.entity";
import { NOTEDEFRAIS_ETAT, LIGNE_TYPE, LIGNEDEFRAIS_ETAT, USER_ROLES } from "../../entity/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { genSaltSync, hashSync } from "bcrypt";
import { Service } from "../../entity/service.entity";
import { CollaborateurAnterieur } from "../../entity/collaborateuranterieur.entity";
import { ChefAnterieur } from "../../entity/chefanterieur.entity";
import { Notification } from "../../entity/notification.entity";
import { insertNote } from ".";
import { Avance } from "../../entity/avance.entity";
import { montantAvance } from "./ligne";

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
                    email: (prenom + "." + nom + "@pops2122.fr").toLowerCase(),
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
        const missionname = [["Consultant 3j Client", "formation au nouveau logicielle", "Visite usine de production"],
        ["Coloque de rentré", "Prospection client potentiel Yveline", "Séminaire sur la sécurité informatique" ]];
        for (let i = 0; i < MISSION_NUMBER; i++) {
            const newMission = missionRepo.create({
                titre: missionname[index%SERVICE_NUMBER][i],
                dateDebut: faker.date.past(),
                dateFin: faker.date.future(),
                description: missionname[index%SERVICE_NUMBER][i],
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

        for (const mission of missions) {
            //creation avance
            if (Math.random() > 0.8) {
                await conn.createQueryBuilder()
                    .insert()
                    .into(Avance)
                    .values({
                        montant: faker.datatype.number({ min: 100, max: 10000, precision: 0.01 }),
                        rembourse: faker.datatype.number({ min: 0, max: 1500, precision: 0.01 }),
                        mission: mission,
                        user: user
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
            if ((note.etat == NOTEDEFRAIS_ETAT.VALIDEE || note.etat == NOTEDEFRAIS_ETAT.REFUSEE) && Math.random() > 0.9) {
                await conn.createQueryBuilder()
                    .insert()
                    .into(Notification)
                    .values({
                        description: "La note a été " + note.etat.toLocaleLowerCase(),
                        lu: Math.random() > 0.5,
                        date: faker.date.past(),
                        user: user,
                        note: note
                    })
                    .execute();
            }
            for (const mission of missions) {
                if (Math.random() < 0.7) continue;


                for (let i = 0; i < LIGNE_NUMBER; i++) {
                    const realFiles = ["https://picsum.photos/seed/picsum/800/300.jpg", "http://www.africau.edu/images/default/sample.pdf"];
                    const wrongFiles = ["", "toto.gif"];

                    let ht = faker.datatype.number({ min: 100, max: 1500, precision: 0.01 });
                    let tva = faker.datatype.number({ min: 5, max: 30, precision: 1 });

                    let etat = LIGNEDEFRAIS_ETAT.VALIDEE;

                    if (note.etat == NOTEDEFRAIS_ETAT.REFUSEE) {
                        etat = Math.random() > 0.5 ? LIGNEDEFRAIS_ETAT.VALIDEE :
                            LIGNEDEFRAIS_ETAT.REFUSEE;
                    } else if (note.etat != NOTEDEFRAIS_ETAT.VALIDEE) {
                        etat = Math.random() > 0.5 ? LIGNEDEFRAIS_ETAT.VALIDEE :
                            Math.random() > 0.5 ? LIGNEDEFRAIS_ETAT.REFUSEE :
                                LIGNEDEFRAIS_ETAT.BROUILLON;
                    }

                    let type = Math.random() > 0.3 ? LIGNE_TYPE.REPAS :
                        Math.random() > 0.5 ? LIGNE_TYPE.DEPLACEMENT :
                            Math.random() > 0.3 ? LIGNE_TYPE.LOGEMENT :
                                Math.random() > 0.5 ? LIGNE_TYPE.EVENEMENT_PROFESSIONNEL :
                                    LIGNE_TYPE.AUTRE;

                    let titre;
                    switch (type) {
                        case LIGNE_TYPE.LOGEMENT:
                            titre = Math.random() > 0.5 ? "Hotel" :
                                Math.random() > 0.5 ? "RB&B" :
                                    "B&B";

                            ht = faker.datatype.number({ min: 50, max: 500, precision: 0.01 });
                            tva = 10;
                            break;

                        case LIGNE_TYPE.DEPLACEMENT:
                            titre = Math.random() > 0.3 ? "Billet de train" :
                                Math.random() > 0.5 ? "Taxis" :
                                    Math.random() > 0.5 ? "Frais kilométriques" :
                                        "Billet d'avion";
                            ht = faker.datatype.number({ min: 50, max: 200, precision: 0.01 });
                            tva = 10;
                            if (titre == "Billet d'avion") {
                                ht = faker.datatype.number({ min: 50, max: 1000, precision: 0.01 });
                            }
                            break;

                        case LIGNE_TYPE.EVENEMENT_PROFESSIONNEL:
                            titre = Math.random() > 0.3 ? "Séminaire" :
                                Math.random() > 0.5 ? "Conférence" :
                                    Math.random() > 0.5 ? "Colloques" :
                                        "Salons";
                            ht = faker.datatype.number({ min: 30, max: 100, precision: 0.01 });
                            tva = 20;
                            break;

                        case LIGNE_TYPE.REPAS:
                            titre = Math.random() > 0.5 ? "Restaurant" :
                                Math.random() > 0.5 ? "Achat nouriture" :
                                    "Bar";
                            ht = faker.datatype.number({ min: 10, max: 50, precision: 0.01 });
                            tva = faker.datatype.number({ min: 10, max: 20, precision: 1 });
                            break;

                        default:
                            titre = faker.commerce.product();
                            break;
                    }
                    const ttc = ht * (1 + tva/100);
                    let avance = false;
                    if (i != LIGNE_NUMBER-1) {
                        avance = Math.random() > 0.5 ? true: false;
                    }
                    await conn.createQueryBuilder()
                        .insert()
                        .into(LigneDeFrais)
                        .values([
                            {
                                avance: false,
                                titre: titre,
                                date: faker.date.between(mission.dateDebut.toDateString(), mission.dateFin.toDateString()),
                                etat: etat,
                                prixHT: ht,
                                prixTTC: ttc,
                                prixTVA: tva,
                                justificatif: Math.random() > 0.5 ? realFiles[Math.floor(Math.random() * realFiles.length)] : realFiles.concat(wrongFiles)[Math.floor(Math.random() * (realFiles.length + wrongFiles.length))],
                                perdu: false,
                                type: type,
                                note: note,
                                mission: mission,
                                commentaire: "",
                                commentaire_validateur: ""
                            }
                        ])
                        .execute();
                        
                        if (avance) {
                            montantAvance(user, mission, ttc, 0);
                        }else{
                            montantAvance(user, mission, 0, ttc);
                        }
                        
                }
            }
        }
    }
    conn.close();
    res.status(200).json({ done: ":)" })
}
