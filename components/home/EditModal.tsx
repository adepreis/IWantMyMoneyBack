import { Modal } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { LineToSave, UILigne, UINote } from "../../pages/home/[params]";
import EditLineForm from "../EditLineForm";

type EditModalProps = {
    note: NonNullable<UINote>,
    editedLine: UILigne | null,
    localLines: LineToSave[],
    setLocalLinse: Dispatch<SetStateAction<LineToSave[]>>,
    opened: boolean,
    setOpened: Dispatch<SetStateAction<boolean>>,
}

export default function EditModal(props: EditModalProps) {
    const {note, editedLine, opened, setOpened, localLines, setLocalLinse} = props;

    return <Modal centered opened={opened}
        onClose={() => setOpened(false)}
        title={editedLine ? "Modifier une ligne de frais" : "Ajouter une ligne de frais"}
        size="lg" padding="xl"
        closeOnClickOutside={false}  // to avoid miss-clicks
        closeButtonLabel="Fermer la boite modale"
    >
        <EditLineForm 
            line={editedLine} 
            setOpened={setOpened}
            linesToSave={localLines} 
            setLineToSave={setLocalLinse}
            note={note}
        />
    </Modal>
}