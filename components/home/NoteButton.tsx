import { Button, Group, Space } from "@mantine/core"
import { useNotifications } from "@mantine/notifications"
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
}

const saveNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps) => {
    const {notes, month, setMonth, year, refreshProps, setNote} = props;

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
    await refreshProps();

    // Procéder à la sauvegarde des lignes

    notifications.showNotification({
        title: 'Note sauvegardée !',
        message: `La note de ${dayjs.months()[note.mois]} ${note.annee} a été sauvegardée !`,
    })
  }

const deleteNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps) => {
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
  }

export default function NoteButtons(props: NoteButtonsProps) {
    const {note, setOpenedModal, setEditedLine} = props;
    const notifications = useNotifications();

    return <Group direction="row" spacing={0} style={{paddingLeft: "1rem"}}>
        {note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION &&
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
            <PopoverButton disabled={note.etat !== NOTEDEFRAIS_ETAT.BROUILLON} label="Vous ne pouvez pas sauvegarder une note dans cet état.">
                <Button variant="outline"
                    onClick={() => saveNote(props, notifications)}
                >Sauvegarder</Button>
            </PopoverButton>
            <PopoverButton disabled={!(note as INoteDeFrais)?.id || note.etat !== NOTEDEFRAIS_ETAT.BROUILLON} label="Vous ne pouvez pas supprimer une note dans cet état.">
                <Button variant="outline" color="red"
                    onClick={() => deleteNote(props, notifications)}
                >Supprimer</Button>
            </PopoverButton>
        </Group>
    </Group>
}