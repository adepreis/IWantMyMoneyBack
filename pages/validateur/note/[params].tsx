import { Group, Loader, Text, Button, Title } from "@mantine/core";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Note from "../../../components/home/Note";
import { RequestError } from "../../../entity/geneal_struct";
import { INoteDeFrais } from "../../../entity/notedefrais.entity";
import { NOTEDEFRAIS_ETAT, USER_ROLES } from "../../../entity/utils";
import { getNoteValidateur } from "../../api/validateur/[note]";
import { ValidatorProps } from "../[params]";
import dayjs from 'dayjs'
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/fr";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");
import { HiArrowSmLeft } from "react-icons/hi";

export interface ValidatorNoteProps extends ValidatorProps {
    note?: INoteDeFrais
}

export default function ValidatorNote(props: Required<ValidatorNoteProps>) {
    const {note} = props;

    return note ? <Group style={{width: "100%"}}>
        <Group style={{width: "100%", borderBottom: "solid 1px #373a40", padding: "0.75rem"}}>
            <Button
                component="a"
                rel="noopener noreferrer"
                href="/validateur"
                leftIcon={<HiArrowSmLeft />}
            >Retour</Button>
            <Title order={5}>{`Note de ${dayjs.months()[note.mois]} ${note.annee} de ${note.user?.prenom} ${note.user?.nom}${note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ? "" : " - Visionnage"}`}</Title>
        </Group>
        <Note
            notes={[note]}
            note={note}
            setNote={() => {}}
            month={note.mois}
            setMonth={() => {}}
            year={note.annee}
            refreshProps={async (month: number) => {}}
            edited={false}
            setEdited={() => {}}
            clearLocalState={false}
            setClearLocalState={() => {}}
            mode={USER_ROLES.CHEF_DE_SERVICE}
        /> 
    </Group>: <Loader />
}

export const getServerSideProps: GetServerSideProps<ValidatorNoteProps> = async (context) => {
    const session = await getSession(context);
  
    if (!session) {
        return {
            redirect: {
            permanent: false,
                destination: "/",
            },
            props: {session},
        }
    }

    const noteId = context.query.params as string;
    const noteRequest = await getNoteValidateur(noteId, session.id as string);

    if ((noteRequest as RequestError)?.error || (noteRequest as {message: string})?.message) {
        return {
            redirect: {
            permanent: false,
                destination: "/",
            },
            props: {session},
        }
    }
  
    return {
        props: {
            session,
            note: noteRequest as INoteDeFrais
        },
    }
}