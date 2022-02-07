import { LIGNE_TYPE, NOTEDEFRAIS_ETAT } from "../../entity/utils"
import { ActionIcon, Group, MantineTheme, Space, Text, useMantineTheme } from "@mantine/core";
import { LineToSave, UILigne } from "../../pages/home/[params]";
import { HiDocumentAdd, HiOutlinePencil, HiX } from "react-icons/hi";
import { Dispatch, SetStateAction } from "react";
import { useModals } from "@mantine/modals";
import { ModalsContext } from "@mantine/modals/lib/context";
import dayjs from "dayjs";
import { IMission } from "../../entity/mission.entity";
import { TempLigneDeFrais } from "../EditLineForm";
import { ILigneDeFrais } from "../../entity/lignedefrais.entity";

type LineButtonsProps = {
    noteState: NOTEDEFRAIS_ETAT,
    line: UILigne,
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>,
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    localLines: LineToSave[];
    setLocalLines: Dispatch<SetStateAction<LineToSave[]>>;
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
                        if (l.line.id === line.id) {
                            return {
                                line: l.line,
                                action: l.action === "delete" ? "post" : "delete"
                            }
                        }
                        return l;
                    }))
                } else {
                    const editedLine = localLines.find(l => l.line.id === line.id);
                    const filtered = localLines.filter(l => l.line.id !== line.id);
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
				        setLocalLines([...filtered, {line: (tempLine as TempLigneDeFrais), action: "delete"}]);
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

export default function LineButtons(props: LineButtonsProps) {
    const {noteState} = props;
    const modals = useModals();
    const theme = useMantineTheme();

    if (!(noteState !== NOTEDEFRAIS_ETAT.VALIDEE && noteState !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION)) {
        return <></>
    }

    return <td>
        <Group direction="row" spacing={0}>
            {editButton(props, theme)}
            {removeRestoreButton(props, modals)}
        </Group>
    </td>
}