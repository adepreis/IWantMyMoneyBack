import { Group } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// import { getValidatorNote, ValidatorNote } from '../api/home'
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
import { TempLigneDeFrais } from '../../components/EditLineForm'
import NavigationBar from '../../components/NavigationBar'
import Note from '../../components/home/Note'
import { Routes } from '../../utils/api'
// import dayjs from 'dayjs'
// import "dayjs/locale/fr";
// import localeData from "dayjs/plugin/localeData";
// dayjs.extend(localeData);
// dayjs().format();
// dayjs.locale("fr");

export interface ValidatorProps {
  session: Session | null,
  // notes?: INoteDeFrais[],
  // years?: number[],
}


export default function Validator(props: ValidatorProps) {
  const router = useRouter();
  const year = parseInt(router.query.params as string);
  const [month, setMonth] = useState(0);
  // const [note, setNote] = useState(null as UINote);
  const [edited, setEdited] = useState(false);
  const [clearLocalState, setClearLocalState] = useState(false);

  /*
  const updateNoteState = async (month: number) => {
    const currentNoteId = props?.notes?.find(note => note.mois === month)?.id;

    if (currentNoteId) {
      const res = await Routes.NOTE.get(currentNoteId);
      setNote(res);
    } else {
      setNote(emptyNote(month, year))
    }
  }

  useEffect(() => {
    updateNoteState(0);
  }, []);

  useEffect(() => {
    if (note && note.mois === -1) {
      updateNoteState(month);
    }
  })
  */

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <p>🚧 <strong>WIP</strong> 🚧<br/>🚧 Ceci sera la future page validateur 🚧</p>
  </Group>
}

export const getServerSideProps: GetServerSideProps<ValidatorProps> = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {session}
    }
  }

  // const currentYear = parseInt(context.query.params as string);
  // const notes = JSON.parse(JSON.stringify(await getValidatorNote(session))) as ValidatorNote;
  // const years = notes.map(note => note.annee);

  return {
    props: {
      session,
  //     notes: (notes.find(note => note.annee === currentYear))?.notes,
  //     years
    },
  }
}