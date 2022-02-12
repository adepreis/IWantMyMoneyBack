import { Button, Group, Space, Text } from "@mantine/core"
import { useNotifications } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { NotificationsContextProps } from "@mantine/notifications/lib/types"
import dayjs from "dayjs"
import router from "next/router"
import { Dispatch, SetStateAction } from "react"
import { HiPlus } from "react-icons/hi"
import { INoteDeFrais } from "../../entity/notedefrais.entity"
import { NOTEDEFRAIS_ETAT } from "../../entity/utils"
import { UILigne, UINote } from "../../pages/home/[params]"
import { Routes } from "../../utils/api"
import { PopoverButton } from "../PopoverButton"
import { ModalsContext } from "@mantine/modals/lib/context";

type NoteButtonsProps = {
    notes: INoteDeFrais[];
    note: NonNullable<UINote>;
    setNote: Dispatch<SetStateAction<UINote>>;
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>;
    month: number;
    setMonth: Dispatch<SetStateAction<number>>;
    year: number;
    refreshProps: () => Promise<void>;
    localLines: UILigne[];
    setLocalLines: Dispatch<SetStateAction<UILigne[]>>;
}

const saveNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps) => {
    const {notes, month, setMonth, year, refreshProps, setNote, localLines, setLocalLines} = props;

    // Forcing type INoteDeFrais since note is created bellow if undefined
    var note = notes.find(n => n.mois === month) as INoteDeFrais;
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
    setLocalLines([]);
    await router.replace(router.asPath);
    await refreshProps();

    // Procéder à la sauvegarde des lignes
    for (const localLine of localLines) {
        const isNewLine = localLine.id.includes("temp-");
        var req: any = null;
        switch (localLine.UI) {
            case "default":
                // Default saved line state, should not be part of localLine
                break;
            case "delete": {
                if (isNewLine) {
                    // Doing nothing since local new line was deleted
                } else {
                    req = await Routes.LINE.delete(localLine.id);
                }
                break;
            }
            case "post": {
                if (isNewLine) {
                    req = await Routes.LINE.create(localLine, note);
                } else {
                    // Doing nothing since only new line can be posted
                }
                break;
            }
            case "put": {
                if (isNewLine) {
                    // Doing nothing since we can't modify a new line
                } else {
                    req = await Routes.LINE.edit(localLine, note);
                }
                break;
            }
        }

        if (!req) {
            notifications.showNotification({
                title: 'Erreur !',
                color: "red",
                message: `Nous venons de rencontrer un problème 😔`,
            });
            continue;
        }
    }

    notifications.showNotification({
        title: 'Note sauvegardée !',
        message: `La note de ${dayjs.months()[note.mois]} ${note.annee} a été sauvegardée !`,
    })
  }

const deleteNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps, modals: ModalsContext) => {
    modals.openConfirmModal({
        title: 'Confirmation de suppression',
        children: (
            <>
                <Text size="sm">
                {"Vous êtes sur le point de supprimer une note."} 
                </Text>
                <Space h="md" />
                <Text size="sm">
                {"Cette action est irréversible."}
                </Text>
            </>
        ),
        labels: { confirm: 'Supprimer', cancel: "Annuler" },
        onCancel: () => {},
        onConfirm: async () => {
            const {notes, month, setMonth, setNote, refreshProps} = props;
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
            await refreshProps();
        
            notifications.showNotification({
                title: 'Brouillon supprimé !',
                message: `Le brouillon de la note de ${dayjs.months()[note.mois]} ${note.annee} a été supprimé !`,
            });
        },
    })

  }

export default function NoteButtons(props: NoteButtonsProps) {
    const {note, setOpenedModal, setEditedLine, localLines} = props;
    const notifications = useNotifications();
    const modals = useModals();

    const editable = ![NOTEDEFRAIS_ETAT.VALIDEE, NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION].includes(note.etat);

    return <Group direction="row" spacing={0} style={{paddingLeft: "1rem"}}>
        {editable &&
            <>
                <Button variant="outline" title="Ajouter une ligne de frais" color="green" leftIcon={<HiPlus size={16}/>} onClick={() => {
                    setOpenedModal(true);
                    setEditedLine(null)
                }}>
                    Ajouter une ligne
                </Button>
                <Space w="md"/>
            </>
        }
        <Group style={{paddingLeft: "1rem"}}>
            <PopoverButton disabled={!editable || localLines.length === 0} label="Vous ne pouvez pas sauvegarder une note dans cet état.">
                <Button variant="outline"
                    onClick={() => saveNote(props, notifications)}
                >Sauvegarder</Button>
            </PopoverButton>
            <PopoverButton disabled={!editable} label="Vous ne pouvez pas supprimer une note dans cet état.">
                <Button variant="outline" color="red"
                    onClick={() => deleteNote(props, notifications, modals)}
                >Supprimer</Button>
            </PopoverButton>
        </Group>
    </Group>
}