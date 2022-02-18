import { Group } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { getHomeNote, HomeNote } from '../api/home'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import { TempLigneDeFrais } from '../../components/EditLineForm'
import { useRouter } from 'next/router'
import NavigationBar from '../../components/NavigationBar'
import { Routes } from '../../utils/api'
import Note from '../../components/home/Note'
import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

export interface HomeProps {
  session: Session | null,
  notes?: INoteDeFrais[],
  years?: number[],
}

export type EmptyNote = Omit<INoteDeFrais, "id" | "user">;

export type UINote = INoteDeFrais | EmptyNote | null;
export type UILigne = (ILigneDeFrais | TempLigneDeFrais) & { UI: "default" | "delete" | "post" | "put"}

const emptyNote = (year: number, month: number): EmptyNote => {
  return {
    annee: year,
    mois: month,
    etat: NOTEDEFRAIS_ETAT.BROUILLON,
    lignes: [],
    notifications: []
  }
}

export default function Home(props: HomeProps) {
  const router = useRouter();
  const year = parseInt(router.query.params as string);
  const [month, setMonth] = useState(0);
  const [note, setNote] = useState(null as UINote);
  const [edited, setEdited] = useState(false);
  const [clearLocalState, setClearLocalState] = useState(false);

  const updateNoteState = async (month: number) => {
    const currentNoteId = props?.notes?.find(note => note.mois === month)?.id;

    if (currentNoteId) {
      const res = await Routes.NOTE.get(currentNoteId);
      setNote(res);
    } else {
      setNote(emptyNote(year, month))
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

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <Group grow style={{alignItems: "baseline"}} direction="row">
      <Note 
        notes={props.notes as INoteDeFrais[]}
        setMonth={setMonth}
        note={note}
        setNote={setNote}
        month={month} 
        year={year}
        refreshProps={async (month: number) => {
          await updateNoteState(-1)
          await updateNoteState(month)
        }}
        edited={edited}
        setEdited={setEdited}
        clearLocalState={clearLocalState}
        setClearLocalState={setClearLocalState}
      />
    </Group>
    <NavigationBar 
      {...props} 
      setNote={setNote} 
      month={month} setMonth={setMonth} 
      year={year}
      updateNoteState={updateNoteState}
      edited={edited}
      setClearLocalState={setClearLocalState}
    />
  </Group>
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
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

  const currentYear = parseInt(context.query.params as string);
  const notes = JSON.parse(JSON.stringify(await getHomeNote(session))) as HomeNote;
  const years = notes.map(note => note.annee);

  return {
    props: {
      session,
      notes: (notes.find(note => note.annee === currentYear))?.notes,
      years
    },
  }
}