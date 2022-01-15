import { Button, Group, SegmentedControl, Center, Select } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { getHomeNote, HomeNote, HomeNoteRequest } from './api/home'
import { useState, useEffect } from 'react'
import { HiOutlineLogout, HiClock, HiXCircle, HiCheck } from "react-icons/hi";
/// <reference types="@dayjs/relative-time" />
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { Notes } from './api/[note]'
import { NOTEDEFRAIS_ETAT } from '../entity/notedefrais.entity'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type Props = {
  session: Session | null,
}

enum DataState {NONE, SENT_AND_WAITING, ERROR, VALID};
type Data = {label: string; state: DataState}

function getSegmentedData(homeNote: HomeNote, year: number | null): Data[] {
  const yearlyNote = year ? (homeNote.find(note => note.annee === year) ?? null) : null;
  console.log(yearlyNote);
  return dayjs.months().map((month, monthIndex) => {
    const monthNote: Notes | null = yearlyNote ? (yearlyNote.notes.find(note => note.mois === monthIndex) ?? null) : null;
    // console.log(monthNote);
    return {
      label: `${month}`,
      state: !monthNote ? DataState.NONE : 
        monthNote.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ? DataState.SENT_AND_WAITING : 
        monthNote.etat === NOTEDEFRAIS_ETAT.REFUSEE ? DataState.ERROR :
        monthNote.etat === NOTEDEFRAIS_ETAT.VALIDEE ? DataState.VALID : DataState.NONE
    }
  })
}

export default function Home(props: Props) {
    const [homeNote, setNotes] = useState([] as HomeNote);
    const [years, setYears] = useState([] as number[]);
    const [year, setYear] = useState(null as (null | number));
    
    useEffect(() => {
      const fetchData = async () => {
        const currentYear = dayjs().year();

        const result = await fetch("/api/home");
        const notes = await result.json() as HomeNote;

        const years = notes.map(note => note.annee);
        
        setNotes(notes);
        setYears(years);
        setYear(years.find(year => year === currentYear) ? currentYear : null)
      };
      fetchData();
    }, []);
    

    return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
      <Center>
        <p>Ma note de frais</p>
      </Center>
      <Group style={{flex: 0, width: "100%"}} spacing={0}>
        <Select
          placeholder="Année"
          data={years.map(year => { return {
              value: `${year}`,
              label: `${year}`
            }
          })}
          value={year ? `${year}` : null}
          onChange={(item: string) => {
            setYear(parseInt(item));
          }}
          style={{
            flex: "unset"
          }}
        />
        <SegmentedControl style={{flex: 1}} fullWidth data={getSegmentedData(homeNote, year).map(el => {
          var icon = <></>;
          switch (el.state) {
            case DataState.NONE:
              break;
            case DataState.SENT_AND_WAITING:
              icon = <HiClock />
              break;
            case DataState.ERROR:
              icon = <HiXCircle />
              break;
            case DataState.VALID:
              icon = <HiCheck />
              break;
          }
          return {
            value: el.label,
            label: (
              <Center>
                <div style={{ marginRight: 10, textTransform: "capitalize" }}>{el.label}</div>
                {icon}
              </Center>
            ),
          }
        })} />
      </Group>
    </Group>
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
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
