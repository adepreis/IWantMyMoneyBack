import { Button, Group, Space, Text } from "@mantine/core"
import { useNotifications } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { NotificationsContextProps } from "@mantine/notifications/lib/types"
import dayjs from "dayjs"
import router from "next/router"
import { Dispatch, SetStateAction } from "react"
import { HiPlus, HiSave, HiPaperAirplane, HiTrash } from "react-icons/hi"
import { INoteDeFrais } from "../../entity/notedefrais.entity"
import { LIGNEDEFRAIS_ETAT, NOTEDEFRAIS_ETAT, USER_ROLES } from "../../entity/utils"
import { UILigne, UINote } from "../../pages/home/[params]"
import { Routes } from "../../utils/api"
import { PopoverButton } from "../PopoverButton"
import { ModalsContext } from "@mantine/modals/lib/context";
import { HiCheck, HiOutlineX } from "react-icons/hi";
import { ILigneDeFrais } from "../../entity/lignedefrais.entity";

type NoteButtonsProps = {
    notes: INoteDeFrais[];
    note: NonNullable<UINote>;
    setNote: Dispatch<SetStateAction<UINote>>;
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>;
    month: number;
    setMonth: Dispatch<SetStateAction<number>>;
    year: number;
    refreshProps: (month: number) => Promise<void>;
    localLines: UILigne[];
    setLocalLines: Dispatch<SetStateAction<UILigne[]>>;
    mode: USER_ROLES;
}

const saveNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps) => {
    const {notes, month, setMonth, year, refreshProps, setNote, localLines, setLocalLines, mode} = props;

    // Forcing type INoteDeFrais since note is created bellow if undefined
    var note = notes.find(n => n.mois === month) as INoteDeFrais;
    if (!note) {
        const temp = await Routes.NOTE.create({mois: month, annee: year});

        if (temp) {
            note = {
                id: (temp.idNote) as string,
                annee: year,
                mois: month,
                user: null,
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

    setNote(null);
    setLocalLines([]);

    // Procéder à la sauvegarde des lignes
    for (const localLine of localLines) {
        const isNewLine = localLine.id.includes("temp-");
        var req: any = null;
        if (mode === USER_ROLES.CHEF_DE_SERVICE) {
            if (localLine.UI !== "default") {
                req = await Routes.VALIDATEUR.LINE.edit({
                    id: localLine.id,
                    etat: (localLine as ILigneDeFrais).etat,
                    commentaire_validateur: (localLine as ILigneDeFrais).commentaire_validateur ?? "",
                })
            }
        } else {
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

    await router.replace(router.asPath);
    await refreshProps(month);
    setMonth(month);
}

const sendNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps) => {
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
        const temp = await Routes.NOTE.edit(note.id);
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
    await refreshProps(month);

    notifications.showNotification({
        title: 'Note soumise à validation !',
        message: `La note de ${dayjs.months()[note.mois]} ${note.annee} a été soumise à validation !`,
    });
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
            await refreshProps(month);
        
            notifications.showNotification({
                title: 'Brouillon supprimé !',
                message: `Le brouillon de la note de ${dayjs.months()[note.mois]} ${note.annee} a été supprimé !`,
            });
        },
    })
}

const validateNote = async (props: NoteButtonsProps, notifications: NotificationsContextProps, modals: ModalsContext, etat: NOTEDEFRAIS_ETAT) => {
    modals.openConfirmModal({
        title: `${etat === NOTEDEFRAIS_ETAT.REFUSEE ? "Refuser" : "Valider"} la note`,
        children: (
            <>
                <Text size="sm">
                    {"Cette action est irréversible."}
                </Text>
            </>
        ),
        labels: { confirm: `${etat === NOTEDEFRAIS_ETAT.REFUSEE ? "Refuser" : "Valider"}`, cancel: "Annuler" },
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
                const temp = await Routes.VALIDATEUR.NOTE.edit({
                    id: note.id,
                    etat
                });
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
            await refreshProps(month);
        
            notifications.showNotification({
                title: "Confirmation de l'action validateur !",
                message: `La note a été ${etat === NOTEDEFRAIS_ETAT.REFUSEE ? "refusée" : "validée"} !`,
            });
        },
    })
}

export default function NoteButtons(props: NoteButtonsProps) {
    const {note, setOpenedModal, setEditedLine, localLines, mode} = props;
    const notifications = useNotifications();
    const modals = useModals();

    const editable = 
        mode === USER_ROLES.USER ? ![NOTEDEFRAIS_ETAT.VALIDEE, NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION].includes(note.etat) :
        mode === USER_ROLES.CHEF_DE_SERVICE ? note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION : false;

    return <Group direction="row" spacing={0} style={{paddingLeft: "1rem"}}>
        {editable && mode === USER_ROLES.USER &&
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
        {editable && <Group style={{paddingLeft: "1rem"}}>
            <PopoverButton disabled={!editable || localLines.length === 0} label="Vous ne pouvez pas enregistrer une note dans cet état.">
                <Button variant="outline"
                    leftIcon={<HiSave size={16} />}
                    onClick={() => saveNote(props, notifications)}
                >Sauvegarder</Button>
            </PopoverButton>
            {mode === USER_ROLES.USER && <PopoverButton disabled={!editable || localLines.length !== 0 || !(note as INoteDeFrais).id} label="Vous ne pouvez pas enregistrer et demander la validation d'une note dans cet état.">
                <Button variant="outline"
                    leftIcon={<HiPaperAirplane size={16} />}
                    onClick={() => sendNote(props, notifications)}
                >Demande de validation</Button>
            </PopoverButton>}
            {mode === USER_ROLES.USER && <PopoverButton disabled={!editable} label="Vous ne pouvez pas supprimer une note dans cet état.">
                <Button variant="outline" color="red"
                    leftIcon={<HiTrash size={16} />}
                    onClick={() => deleteNote(props, notifications, modals)}
                >Supprimer</Button>
            </PopoverButton>}
            {mode === USER_ROLES.CHEF_DE_SERVICE && <PopoverButton disabled={!editable || localLines.length !== 0 || note.lignes.filter(l => l.etat === LIGNEDEFRAIS_ETAT.REFUSEE).length !== 0} label="Vous ne pouvez pas valider une note dans cet état.">
                <Button variant="outline"
                    leftIcon={<HiCheck size={16} />}
                    onClick={() => validateNote(props, notifications, modals, NOTEDEFRAIS_ETAT.VALIDEE)}
                >Validation</Button>
            </PopoverButton>}
            {mode === USER_ROLES.CHEF_DE_SERVICE && <PopoverButton disabled={!editable || localLines.length !== 0 || note.lignes.filter(l => l.etat === LIGNEDEFRAIS_ETAT.REFUSEE).length === 0} label="Vous ne pouvez pas refuser une note dans cet état.">
                <Button variant="outline" color="red"
                    leftIcon={<HiOutlineX size={16} />}
                    onClick={() => validateNote(props, notifications, modals, NOTEDEFRAIS_ETAT.REFUSEE)}
                >Refuser</Button>
            </PopoverButton>}
        </Group>}
    </Group>
}