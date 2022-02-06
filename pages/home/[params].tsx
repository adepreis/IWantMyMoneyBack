import { Group, Center, Table, Space, Loader, Accordion, Button, ActionIcon, Modal, Text, Badge, Popover, useMantineTheme } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { getHomeNote, HomeNote } from '../api/home'
import { useEffect, useState } from 'react'
import { HiOutlinePencil, HiX, HiOutlinePaperClip, HiPlus, HiDocumentAdd, HiTrash } from "react-icons/hi";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import EditLineForm, { TempLigneDeFrais } from '../../components/EditLineForm'
import numbro from 'numbro'
import { useRouter } from 'next/router'
import { IMission } from '../../entity/mission.entity'
import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
import NavigationBar from '../../components/NavigationBar'
import { Routes } from '../../utils/api'
import { useNotifications } from '@mantine/notifications'
import { PopoverButton } from '../../components/PopoverButton'
import { useModals } from '@mantine/modals'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

export interface HomeProps {
  session: Session | null,
  notes?: INoteDeFrais[],
  years?: number[],
}

export type EmptyNote = Omit<INoteDeFrais, "id">;

export type UINote = INoteDeFrais | EmptyNote | null;
export type UILigne = (ILigneDeFrais | TempLigneDeFrais) & { UI: "default" | "delete" | "post" | "put"}
type LineToSave = {
  line: TempLigneDeFrais,
  action: 'delete' | 'post' | 'put',
}

export default function Home(props: HomeProps) {
  const router = useRouter();
  const theme = useMantineTheme();
  const modals = useModals();
  const notifications = useNotifications();
  const year = parseInt(router.query.params as string);
  const [month, setMonth] = useState(0);

  const [note, setNote] = useState(null as UINote);
  const [opened, setOpened] = useState(false);
  const [lineToEdit, setLineToEdit] = useState(null as UILigne | null);
  const [linesToSave, setLineToSave] = useState([] as LineToSave[])

  const edited = linesToSave.length !== 0;

  const updateNoteState = async (month: number) => {
    const currentNoteId = props?.notes?.find(note => note.mois === month)?.id;

    const emptyNote: EmptyNote = {
      annee: year,
      mois: month,
      etat: NOTEDEFRAIS_ETAT.BROUILLON,
      lignes: [],
      notifications: []
    }

    if (currentNoteId) {
      const res = await Routes.NOTE.get(currentNoteId);
      setNote(res);
    } else {
      setNote(emptyNote)
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

  const saveNote = async (notes: INoteDeFrais[], month: number) => {
    var note = notes.find(n => n.mois === month);
    if (!note) {
      const temp = await Routes.NOTE.create({mois: month, annee: year});

      if (temp) {
        note = {
          id: (temp.idNote) as string,
          annee: year,
          mois: month,
          etat: NOTEDEFRAIS_ETAT.BROUILLON,
          lignes: [],
          notifications: []
        }
      }
      else {
        notifications.showNotification({
          title: 'Erreur !',
          color: "red",
          message: `Nous venons de rencontrer un problème 😔`,
        })
        return;
      }
    }

    setMonth(month);
    setNote(null);
    await router.replace(router.asPath);
    await updateNoteState(-1);

    // Procéder à la sauvegarde des lignes

    notifications.showNotification({
      title: 'Note sauvegardée !',
      message: `La note de ${dayjs.months()[note.mois]} ${note.annee} a été sauvegardée !`,
    })
  }

  const deleteNote = async (notes: INoteDeFrais[], month: number) => {
    const note = notes.find(n => n.mois === month);

    if (!note) {
      notifications.showNotification({
        title: 'Erreur !',
        color: "red",
        message: `Nous venons de rencontrer un problème 😔`,
      });
      return;
    } else {
      const temp = await Routes.NOTE.delete(note.id);
      if (!temp) {
        notifications.showNotification({
          title: 'Erreur !',
          color: "red",
          message: `Nous venons de rencontrer un problème 😔`,
        })
        return;
      }
    }

    setMonth(month);
    setNote(null);
    await router.replace(router.asPath);
    await updateNoteState(-1);

    notifications.showNotification({
      title: 'Brouillon supprimé !',
      message: `Le brouillon de la note de ${dayjs.months()[note.mois]} ${note.annee} a été supprimé !`,
    });
  }

  const renderLines = (lines: UILigne[]) => {
    const rows = lines.filter(line => !(line.UI === "default" && linesToSave.find(l => ["put", "delete"].includes(l.action) && l.line.id === line.id))).map((ligne, index) => {
      var icon = <></>;
      switch (ligne.UI) {
        case "post":
          icon = <HiDocumentAdd color={theme.colors.green[6]} size="1.25rem"/>
          break;
        case "delete":
          icon = <HiTrash color={theme.colors.red[6]} size="1.25rem" />
          break;
        case "put":
          icon = <HiOutlinePencil color={theme.colors.yellow[6]} size="1.25rem" />
          break;
      }

      return <tr key={index} style={{
        color: ligne.UI === "post" ? theme.colors.green[6] : 
          ligne.UI === "delete" ? theme.colors.red[6] : 
          ligne.UI === "put" ? theme.colors.yellow[6] : ""
      }}>
        {edited ? <td style={{lineHeight: "0.25rem"}}>{icon}</td> : <></>}
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
            <Group direction="row" spacing={0}>
              {ligne.UI !== "delete" ? <ActionIcon size="xl" radius="lg" title="Modifier la ligne" color="blue" onClick={() => {
                setOpened(true);
                setLineToEdit(ligne);
              }}>
                <HiOutlinePencil/>
              </ActionIcon> : <></>}
              <ActionIcon 
                size="xl" radius="lg" 
                title={ligne.UI !== "delete" ? "Supprimer la ligne" : "Restaurer la ligne"} 
                color={ligne.UI !== "delete" ? "red" : "green"} 
                onClick={() => {
                const switchDelete = () => {
                  if (ligne.id.includes("temp-")) {
                    setLineToSave(linesToSave.map(l => {
                      if (l.line.id === ligne.id) {
                        return {
                          line: l.line,
                          action: l.action === "delete" ? "post" : "delete"
                        }
                      }

                      return l;
                    }))
                  } else {
                    if (ligne.UI === "delete") {
                      setLineToSave(linesToSave.filter(l => l.line.id !== ligne.id));
                    }
                    else {
                      setLineToSave(linesToSave.concat([{
                        line: {
                          ...ligne,
                          files: [] // @TODO: handle files
                        },
                        action: "delete"
                      }]))
                    }
                  }
                }

                if (ligne.UI !== "delete") {
                  modals.openConfirmModal({
                    title: 'Confirmation de suppression',
                    children: (
                      <>
                        <Text size="sm">
                          {"Vous êtes sur le point de supprimer une ligne."} 
                        </Text>
                        <Space h="md" />
                        <Text size="sm">
                          {"Notez toutefois que cette action ne sera appliqué qu'en cas de sauvegarde de la note."}
                        </Text>
                      </>
                    ),
                    labels: { confirm: 'Supprimer', cancel: "Annuler" },
                    onCancel: () => {},
                    onConfirm: () => switchDelete(),
                  })
                } else {
                  switchDelete()
                }
              }}>
                {ligne.UI !== "delete" ? <HiX/> : <HiDocumentAdd />}
              </ActionIcon>
            </Group>
          </td>
        }
      </tr>
    });

    return <Table striped highlightOnHover>
      <thead>
        <tr>
          {edited ? <th>Etat</th> : <></>}
          <th>Titre</th>
          <th>Date</th>
          <th>Montant HT</th>
          <th>Justificatif</th>
          <th>Action</th>
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
      lignes: UILigne[]
    }
    const missions = new Map<string, MissionData>();
    
    const lignes: UILigne[] = note.lignes.map(l => {
      return {
        ...l,
        UI: "default"
      }
    });

    const tempLines: UILigne[] = linesToSave.map(l => {
      return {
        ...l.line,
        UI: l.action
      }
    });

    for (const ligne of lignes.concat(tempLines)) {
      if (missions.has(ligne.mission.id)) {
        ((missions.get(ligne.mission.id) as MissionData).lignes as UILigne[]).push(ligne);
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
      <Accordion offsetIcon={false} style={{width: "100%"}}>
        {
          Array.from(missions).map((mission, key) => {
            return <Accordion.Item label={mission[1].mission.titre} key={key}>
              {renderLines(mission[1].lignes)}
            </Accordion.Item>
          })
        }
      </Accordion>
      {note && note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION &&
        <Button title="Ajouter une ligne de frais" color="green" leftIcon={<HiPlus size={16}/>} onClick={() => {setOpened(true), setLineToEdit(null)}} fullWidth>
          Ajouter une ligne
        </Button>
      }
      <Group style={{padding: "1rem"}}>
        <PopoverButton disabled={note.etat !== NOTEDEFRAIS_ETAT.BROUILLON} label="Vous ne pouvez pas sauvegarder une note dans cet état.">
          <Button 
            onClick={() => saveNote(props.notes as INoteDeFrais[], month)}
          >Sauvegarder</Button>
        </PopoverButton>
        <PopoverButton disabled={!(note as INoteDeFrais)?.id || note.etat !== NOTEDEFRAIS_ETAT.BROUILLON} label="Vous ne pouvez pas supprimer une note dans cet état.">
          <Button color="red"
            onClick={() => deleteNote(props.notes as INoteDeFrais[], month)}
          >Supprimer</Button>
        </PopoverButton>
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