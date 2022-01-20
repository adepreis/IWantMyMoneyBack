import { Group, SegmentedControl, Center, Select, Table, GroupedTransition, Container, Loader } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { getHomeNote, HomeNote } from '../api/home'
import { useEffect, useState } from 'react'
import { HiClock, HiXCircle, HiCheck } from "react-icons/hi";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais, noteToApi } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import numbro from 'numbro'
import { useRouter } from 'next/router'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");


type Props = {
  session: Session | null,
  notes?: INoteDeFrais[],
  years?: number[],
  currentYear?: number;
}

type EmptyNote = Omit<INoteDeFrais, "id">;
type State = {
  note: INoteDeFrais | EmptyNote | null,
  month: number,
}

enum DataState {NONE, SENT_AND_WAITING, ERROR, VALID};
type Data = {label: string; state: DataState, index: number}

function getSegmentedData(props: Props): Data[] {
  return dayjs.months().map((month, monthIndex) => {
    const monthNote: INoteDeFrais | null = props.notes ? (props.notes.find(note => note.mois === monthIndex) ?? null) : null;

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
  const router = useRouter();
  const year = parseInt(router.query.params as string);
  const [month, setMonth] = useState(0);
  const [note, setNote] = useState(null as INoteDeFrais | EmptyNote | null);

  const updateNoteState = async (month: number) => {
    const currentNoteId = props?.notes?.find(note => note.mois === month)?.id;

    const emptyNote: EmptyNote = {
      annee: year,
      mois: month,
      etat: NOTEDEFRAIS_ETAT.NON_VALIDEE,
      ligne: []
    }

    const fetchNote = async (id: string) => {
      const request = await fetch(`/api/${id}`);

      if (request.status === 200) {
        const result = await request.json();
        return result;
      } 
      // Error while fetching
      else {
        return null;
      }
    }

    if (currentNoteId) {
      const res = await fetchNote(currentNoteId);
      setNote(res);
    } else {
      setNote(emptyNote)
    }
  }

  useEffect(() => {
    updateNoteState(0);
  }, []);

  const renderNote = () => {
    if (!note) {
      return <Center style={{height: "100%"}}>
        <Loader />
      </Center>
    }

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

    return <Container padding="lg">
      <Table striped highlightOnHover>
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
    </Container>
  }

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <Group style={{alignItems: "baseline"}} grow>
      {renderNote()}
    </Group>
    <Group style={{flex: 0, width: "100%"}} spacing={0}>
      <Select
        placeholder="Année"
        data={(props?.years ?? []).map(year => { return {
            value: `${year}`,
            label: `${year}`
          }
        })}
        value={year ? `${year}` : null}
        onChange={async (item: string) => {
          setMonth(0),
          setNote(null),
          await router.push(`/home/${item}`);
          updateNoteState(0);
        }}
        style={{
          flex: "unset"
        }}
      />
      <SegmentedControl style={{flex: 1}} value={`${month}`} onChange={async (item: string) => {
        const month = parseInt(item);
        setMonth(month);
        await updateNoteState(month);
      }} fullWidth data={getSegmentedData(props).map(el => {
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

  const currentYear = parseInt(context.query.params as string);
  const notes = JSON.parse(JSON.stringify(await getHomeNote(session))) as HomeNote;
  const years = notes.map(note => note.annee);

  return {
    props: {
      session,
      notes: (notes.find(note => note.annee === currentYear))?.notes,
      years,
      currentYear
    },
  }
}