import { NOTEDEFRAIS_ETAT, USER_ROLES } from "../../entity/utils"
import { ActionIcon, Group, MantineTheme, Space, Text, useMantineTheme } from "@mantine/core";
import { UILigne } from "../../pages/home/[params]";
import { HiDocumentAdd, HiOutlinePencil, HiX } from "react-icons/hi";
import { Dispatch, SetStateAction } from "react";
import { useModals } from "@mantine/modals";
import { ModalsContext } from "@mantine/modals/lib/context";
import { TempLigneDeFrais } from "../EditLineForm";

type LineButtonsProps = {
    noteState: NOTEDEFRAIS_ETAT,
    line: UILigne,
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>,
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    localLines: UILigne[];
    setLocalLines: Dispatch<SetStateAction<UILigne[]>>;
    mode: USER_ROLES;
}

function editButton(props: LineButtonsProps, theme: MantineTheme) {
    const {line, setOpenedModal, setEditedLine} = props;

    return line.UI !== "delete" ? <ActionIcon size="xl" radius="lg" title="Modifier la ligne" color={theme.colors.blue[6]} onClick={() => {
        setOpenedModal(true);
        setEditedLine(line);
    }}>
        <HiOutlinePencil/>
    </ActionIcon> : <></>
}

function removeRestoreButton(props: LineButtonsProps, modals: ModalsContext) {
    const {line, localLines, setLocalLines} = props;

    return <ActionIcon size="xl" radius="lg" 
        title={line.UI !== "delete" ? "Supprimer la ligne" : "Restaurer la ligne"} 
        color={line.UI !== "delete" ? "red" : "green"} 
        onClick={() => {
            const switchDelete = () => {
                if (line.id.includes("temp-")) {
                    setLocalLines(localLines.map(l => {
                        if (l.id === line.id) {
                            const temp: UILigne = {
                                ...l,
                                UI: l.UI === "delete" ? "post" : "delete"
                            }
                            return temp;
                        }
                        return l;
                    }))
                } else {
                    const editedLine = localLines.find(l => l.id === line.id);
                    const filtered = localLines.filter(l => l.id !== line.id);
                    if (editedLine) {
                        // Removing edit
                        setLocalLines(filtered);
                    } else {
                        const tempLine = line;
                        delete (tempLine as any).commentaire_validateur;
                        delete (tempLine as any).etat;
                        delete (tempLine as any).UI;
                        (tempLine as TempLigneDeFrais).files = []; // @TODO: Handle files

                        // Adding delete
				        setLocalLines([...filtered, {...(tempLine as TempLigneDeFrais), UI: "delete"}]);
                    }
                }
            }

            if (line.UI !== "delete") {
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
        }
    }>
        {line.UI !== "delete" ? <HiX/> : <HiDocumentAdd />}
    </ActionIcon>
}

function validatorEditButton(props: LineButtonsProps, theme: MantineTheme) {
    const {line, setOpenedModal, setEditedLine} = props;

    return <ActionIcon size="xl" radius="lg" title="Modifier la ligne" color={theme.colors.blue[6]} onClick={() => {
        setOpenedModal(true);
        setEditedLine(line);
    }}>
        <HiOutlinePencil/>
    </ActionIcon>;
}

export default function LineButtons(props: LineButtonsProps) {
    const {noteState, mode} = props;
    const modals = useModals();
    const theme = useMantineTheme();

    if ((mode === USER_ROLES.USER && (noteState === NOTEDEFRAIS_ETAT.VALIDEE || noteState === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION)) ||
        (mode === USER_ROLES.CHEF_DE_SERVICE && (noteState !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION))) {
        return <></>
    }

    const content = mode === USER_ROLES.USER ? <>
        {editButton(props, theme)}
        {removeRestoreButton(props, modals)}
    </> : <>
        {validatorEditButton(props, theme)}
    </>;

    return <td>
        <Group direction="row" spacing={0}>
            {content}
        </Group>
    </td>
}