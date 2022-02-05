import { Group, Center, Table, GroupedTransition, Container, Loader, Accordion, Button, ActionIcon, Modal, Text } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { getHomeNote, HomeNote } from '../api/home'
import { useEffect, useState } from 'react'
import { HiOutlinePencil, HiX, HiOutlinePaperClip, HiPlus } from "react-icons/hi";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import EditLineForm from '../../components/EditLineForm'
import numbro from 'numbro'
import { useRouter } from 'next/router'
import { IMission } from '../../entity/mission.entity'
import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
import NavigationBar from '../../components/NavigationBar'
import { Routes } from '../../utils/api'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

export interface HomeProps {
  session: Session | null,
  notes?: INoteDeFrais[],
  years?: number[],
}

type EmptyNote = Omit<INoteDeFrais, "id">;

export type UINote = INoteDeFrais | EmptyNote | null;

export default function Home(props: HomeProps) {
  const router = useRouter();
  const year = parseInt(router.query.params as string);
  const [month, setMonth] = useState(0);

  const [note, setNote] = useState(null as UINote);
  const [opened, setOpened] = useState(false);

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

    if (currentNoteId) {
      const res = await Routes.NOTE(currentNoteId);
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
        <td>
          <Group position="center" direction="row" spacing={0}>
            {/*TODO : display form and send PUT query with smtg like :
              const requestOptions = {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'React PUT Request Example' })
              };
              fetch(`/api/${note?.ligne}`, requestOptions)
                  .then(response => response.json())
                  .then(data => this.setState({ postId: data.id }));
            */}
            <ActionIcon size="xl" radius="lg" title="Modifier la ligne" color="blue" onClick={() => setOpened(true)}>
              <HiOutlinePencil/>
            </ActionIcon>
            {/*TODO : send DELETE query with smtg like :
              fetch(`/api/${note?.ligne}`, {method: "DELETE"})
                .then(response => { console.log(response.status); }
              );
            */}
            <ActionIcon size="xl" radius="lg" title="Supprimer la ligne" color="red">
              <HiX/>
            </ActionIcon>
          </Group>
        </td>
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

  const renderNote = () => {
    if (!note) {
      return <Center style={{width: "100%", height: "100%"}}>
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

    return <>
      <Modal centered opened={opened}
          onClose={() => setOpened(false)}
          title="Modifier une ligne de frais"
          size="lg"
        >
        <EditLineForm />
      </Modal>
      <Accordion offsetIcon={false} style={{width: "100%"}}>
        {
          Array.from(missions).map((mission, key) => {
            return <Accordion.Item label={mission[1].mission.titre} key={key}>
              {renderLines(mission[1].lignes)}
            </Accordion.Item>
          })
        }
      </Accordion>
      <Button title="Ajouter une ligne de frais" color="green" leftIcon={<HiPlus size={16}/>} onClick={() => setOpened(true)} fullWidth>
        Ajouter une ligne
      </Button>
      <Group style={{padding: "1rem"}}>
        <Button>Sauvegarder</Button>
        <Button color="red">Supprimer</Button>
      </Group>
    </>
  }

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <Group style={{alignItems: "baseline"}} direction="column">
      {renderNote()}
    </Group>
    <NavigationBar {...props} setNote={setNote} month={month} setMonth={setMonth} year={year} updateNoteState={updateNoteState}/>
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