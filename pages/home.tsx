import { Button, Group, SegmentedControl, Center, Select, Table, GroupedTransition, Container } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { getHomeNote, HomeNote, HomeNoteRequest } from './api/home'
import { useState, useEffect } from 'react'
import { HiOutlineLogout, HiClock, HiXCircle, HiCheck } from "react-icons/hi";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais } from '../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../entity/utils'
import numbro from 'numbro'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type Props = {
  session: Session | null,
  notes?: HomeNote,
  years?: number[],
  currentYear?: number;
}

type State = {
  year: null | number,
  month: number,
}

enum DataState {NONE, SENT_AND_WAITING, ERROR, VALID};
type Data = {label: string; state: DataState, index: number}

function getSegmentedData(props: Props, state: State): Data[] {
  const yearlyNote = state.year ? ((props?.notes ?? []).find(note => note.annee === state.year) ?? null) : null;
  return dayjs.months().map((month, monthIndex) => {
    const monthNote: INoteDeFrais | null = yearlyNote ? (yearlyNote.notes.find(note => note.mois === monthIndex) ?? null) : null;

    return {
      label: `${month}`,
      state: !monthNote ? DataState.NONE : 
        monthNote.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ? DataState.SENT_AND_WAITING : 
        monthNote.etat === NOTEDEFRAIS_ETAT.REFUSEE ? DataState.ERROR :
        monthNote.etat === NOTEDEFRAIS_ETAT.VALIDEE ? DataState.VALID : DataState.NONE,
      index: monthIndex
    }
  })
}

export default function Home(props: Props) {
    const [state, setState] = useState({
      year: props?.currentYear as null | number,
      month: 0
    });

    const currentNote = props.notes?.find(note => note.annee === state.year)?.notes?.find(note => note.mois === state.month) ?? null;

    const renderNote = (note: INoteDeFrais | null) => {
      const rows = (note?.ligne ?? []).map((ligne, index) => (
        <tr key={index}>
          <td>{ligne.titre}</td>
          <td>{dayjs(ligne.date).format("DD-MM-YYYY")}</td>
          <td>{numbro(ligne.prixHT).formatCurrency({ mantissa: 2, 
            currencySymbol: "€", 
            currencyPosition: "postfix",
            spaceSeparated: true ,
            spaceSeparatedCurrency: true,
            thousandSeparated: true,
          }).replace(",", " ")}</td>
          <td>{"TODO"}</td>
        </tr>
      ));

      return <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date</th>
            <th>Montant HT</th>
            <th>Justificatif</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    }

    return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
      <Group style={{alignItems: "baseline"}} grow>
        <Container padding="lg">
          {renderNote(currentNote)}
        </Container>
      </Group>
      <Group style={{flex: 0, width: "100%"}} spacing={0}>
        <Select
          placeholder="Année"
          data={(props?.years ?? []).map(year => { return {
              value: `${year}`,
              label: `${year}`
            }
          })}
          value={state.year ? `${state.year}` : null}
          onChange={(item: string) => {
            setState({
              ...state,
              year: parseInt(item)
            });
          }}
          style={{
            flex: "unset"
          }}
        />
        <SegmentedControl style={{flex: 1}} value={`${state.month}`} onChange={(item: string) => {
          setState({
            ...state,
            month: parseInt(item)
          });
          }} fullWidth data={getSegmentedData(props, state).map(el => {
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
            value: `${el.index}`,
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

  const currentYear = dayjs().year();
  const notes = JSON.parse(JSON.stringify(await getHomeNote(session))) as HomeNote;
  const years = notes.map(note => note.annee);

  return {
    props: {
      session,
      notes,
      years,
      currentYear
    },
  }
}
