import { Group, Loader, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Note from "../../../components/home/Note";
import { RequestError } from "../../../entity/geneal_struct";
import { INoteDeFrais } from "../../../entity/notedefrais.entity";
import { NOTEDEFRAIS_ETAT } from "../../../entity/utils";
import { getNoteValidateur } from "../../api/validateur/[note]";
import { ValidatorProps } from "../[params]";

export interface ValidatorNoteProps extends ValidatorProps {
    note?: INoteDeFrais
}



export default function ValidatorNote(props: Required<ValidatorNoteProps>) {
    const {note} = props;

    return note ? <Group style={{width: "100%"}}>
        <Group style={{width: "100%", borderBottom: "solid 1px #373a40", padding: "0.75rem"}}>
            <Text>{`Note du ${note.mois}/${note.annee} de ${note.user?.prenom} ${note.user?.nom}${note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ? "" : " - Visionnage"}`}</Text>
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