import { Group, SegmentedControl, Center, Select, Table, GroupedTransition, Container, Loader, Accordion, Button, ActionIcon, Modal, Text } from '@mantine/core'
import { HiClock, HiXCircle, HiCheck, HiOutlinePencil, HiX, HiOutlinePaperClip, HiPlus } from "react-icons/hi";
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getHomeNote, HomeNote } from '../api/home'
import { useEffect, useState } from 'react'
import { INoteDeFrais, noteToApi } from '../../entity/notedefrais.entity'
import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
import { IMission, Mission } from '../../entity/mission.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import EditLineForm from '../../components/EditLineForm'
import numbro from 'numbro'
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
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

type LineToSave = {
  line: ILigneDeFrais,
  action: 'delete' | 'post' | 'put',
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
  const [opened, setOpened] = useState(false);
  const [lineToEdit, setLineToEdit] = useState(null as ILigneDeFrais | null);
  const [linesToSave, setLineToSave] = useState([] as LineToSave[])

  const updateNoteState = async (month: number) => {
    console.log("update", month);
    const currentNoteId = props?.notes?.find(note => note.mois === month)?.id;

    const emptyNote: EmptyNote = {
      annee: year,
      mois: month,
      etat: NOTEDEFRAIS_ETAT.BROUILLON,
      lignes: [],
      notifications: []
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

  const renderLines = (lines: ILigneDeFrais[]) => {
    const rows = lines.map((ligne, index) => (
      <tr key={index}>
        <td>{ligne.titre}</td>
        <td>{dayjs(ligne.date).format("DD-MM-YYYY")}</td>
        <td>{numbro(ligne.prixHT).formatCurrency({ mantissa: 2, 
          currencySymbol: "€", 
          currencyPosition: "postfix",
          spaceSeparated: true,
          spaceSeparatedCurrency: true,
          thousandSeparated: true,
        }).replace(",", " ")}</td>
        <td>
          { ligne.perdu
            ? <Text color="red">Pas de justificatif</Text>
            : <Button title="TODO: afficher ligne.justificatif" variant="subtle" rightIcon={<HiOutlinePaperClip size={16}/>}>Justificatif</Button>
          }
        </td>
        {/* Hide buttons when edit/delete is not allowed by note state */}
        {note && note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION &&
          <td>
            <Group position="center" direction="row" spacing={0}>
              <ActionIcon size="xl" radius="lg" title="Modifier la ligne" color="blue" onClick={() => {setOpened(true), setLineToEdit(ligne)}}>
                <HiOutlinePencil/>
              </ActionIcon>
              <ActionIcon size="xl" radius="lg" title="Supprimer la ligne" color="red" onClick={() => {
                  setLineToSave([...linesToSave, {line: ligne, action: 'delete'}]);
                  var updatedLines: ILigneDeFrais[] = note.lignes.filter(function(l) { 
                      return l.id !== ligne.id
                  });
                  note.lignes = updatedLines;
                  setNote(note);

                  console.log(linesToSave); // why first one is missing ?
                }}
              >
                <HiX/>
              </ActionIcon>
            </Group>
          </td>
        }
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

  const renderMissions = () => {
    if (!note) {
      return <Center style={{height: "100%"}}>
        <Loader />
      </Center>
    }

    type MissionData = {
      mission: IMission,
      lignes: ILigneDeFrais[]
    }
    const missions = new Map<string, MissionData>();
    
    for (const ligne of note.lignes) {
      if (missions.has(ligne.mission.id)) {
        ((missions.get(ligne.mission.id) as MissionData).lignes as ILigneDeFrais[]).push(ligne);
      } else {
        missions.set(ligne.mission.id, {
          mission: ligne.mission,
          lignes: [ligne]
        });
      }
    }

    return <Accordion offsetIcon={false} style={{width: "100%"}}>
      {
        Array.from(missions).map((mission, key) => {
          return <Accordion.Item label={mission[1].mission.titre} key={key}>
            {renderLines(mission[1].lignes)}
          </Accordion.Item>
        })
      }
    </Accordion>
  }

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <Group style={{alignItems: "baseline"}} direction="column">
      <Modal centered opened={opened}
        onClose={() => setOpened(false)}
        title={lineToEdit ? "Modifier une ligne de frais" : "Ajouter une ligne de frais"}
        size="lg" padding="xl"
        closeOnClickOutside={false}  // to avoid miss-clicks
        closeButtonLabel="Fermer la boite modale"
      >
        <EditLineForm line={lineToEdit} setOpened={setOpened}
          linesToSave={linesToSave} setLineToSave={setLineToSave}
          note={note} setNote={setNote}
        />
      </Modal>

      {renderMissions()}
      {note && note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION &&
        <Button title="Ajouter une ligne de frais" color="green" leftIcon={<HiPlus size={16}/>} onClick={() => {setOpened(true), setLineToEdit(null)}} fullWidth>
          Ajouter une ligne
        </Button>
      }
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
          setLineToEdit(null),
          setLineToSave([]),
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
        setLineToEdit(null);
        setLineToSave([]);
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