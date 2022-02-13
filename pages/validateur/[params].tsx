import { Group, Alert } from '@mantine/core'
import { HiOutlineSearchCircle } from "react-icons/hi";
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
// import { getValidatorNote, ValidatorNote } from '../api/home'
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
// import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
import ValidatorFilters from '../../components/validateur/ValidatorFilters'
import CardNote from '../../components/validateur/CardNote'
import { Routes } from '../../utils/api'

export interface ValidatorProps {
  session: Session | null
}

export default function Validator(props: ValidatorProps) {
  // array of strings value when multiple is true
  const [query, setQuery] = useState('');
  // const [queryHasResult, setQueryHasResult] = useState(true);
  const [sortStrategy, setSortStrategy] = useState('date_ascending');
  const [filters, setFilters] = useState(['pending', 'todo']);

  const [notes, setNotes] = useState([] as INoteDeFrais[]);

  const updateNotesState = async () => {
    const res = await Routes.VALIDATEUR.get();
    /* TODO: handle res==null ? */
  
    const filteredNotes = res.filter((note: INoteDeFrais, noteIndex: number) => {
      return (note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ||
              note.etat === NOTEDEFRAIS_ETAT.VALIDEE);
    })

    setNotes(filteredNotes);
  }

  useEffect(() => {
    updateNotesState();
  }, []);

  return <Group grow direction="row" style={{width: "100%", margin: 20}}>
    <ValidatorFilters keyword={query}
      setKeyword={setQuery}
      sortStrategy={sortStrategy}
      setSortStrategy={setSortStrategy}
      filters={filters}
      setFilters={setFilters}/>

    {/* TO FIX : ON SMALLER DEVICES, A HUGE GAP APPEARS "HERE" */}

    <Group direction="column" style={{height: "100%", maxWidth: "80%"}} spacing="sm" position="center">
      {/* TODO: set hidden attribute according to a state "queryHasResult" */}
      <Alert hidden={false} icon={<HiOutlineSearchCircle size={25} />}
        title="TODO: conditional alert" color="gray" radius="md" variant="filled">
        Aucune note ne correspond au critères de recherche que vous avez entrés.
      </Alert>

      <Group direction="row" style={{width: "90%", margin: 25}}>
        { notes.map((note: INoteDeFrais, noteIndex: number) => {
            // TODO: apply filters ('pending', 'todo', 'valid')
            // TODO: apply "page" filters (params as/selected year and default/selected month)
            // TODO: order by sortStrategy
            // TODO: find keyword (+ toogle "queryHasResult" state ?)
            return <CardNote key={noteIndex} note={note}/>
          }
        )}
      </Group>

    </Group>
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

  return {
    props: {
      session
    },
  }
}