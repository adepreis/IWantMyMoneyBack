import { Modal } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { USER_ROLES } from "../../entity/utils";
import { UILigne, UINote } from "../../pages/home/[params]";
import EditLineForm from "../EditLineForm";
import ValidatorEditForm from "../validateur/ValidatorEditForm";

type EditModalProps = {
    note: NonNullable<UINote>,
    editedLine: UILigne | null,
    localLines: UILigne[],
    setLocalLine: Dispatch<SetStateAction<UILigne[]>>,
    opened: boolean,
    setOpened: Dispatch<SetStateAction<boolean>>,
    setViewedLine: Dispatch<SetStateAction<UILigne | null>>,
    mode: USER_ROLES
}

export default function EditModal(props: EditModalProps) {
    const {note, editedLine, opened, setOpened, localLines, setLocalLine, setViewedLine, mode} = props;

    const title = mode === USER_ROLES.USER ? (editedLine ? "Modifier une ligne de frais" : "Ajouter une ligne de frais") :
        mode === USER_ROLES.CHEF_DE_SERVICE ? "Pointer une ligne" : "";

    return <Modal centered opened={opened}
        onClose={() => setOpened(false)}
        title={title}
        size="lg" padding="xl"
        closeOnClickOutside={false}  // to avoid miss-clicks
        closeButtonLabel="Fermer la boite modale"
    >
        {mode === USER_ROLES.USER ? <EditLineForm 
            line={editedLine} 
            setOpened={setOpened}
            linesToSave={localLines} 
            setLineToSave={setLocalLine}
            note={note}
            setViewedLine={setViewedLine}
        /> : mode === USER_ROLES.CHEF_DE_SERVICE ? <ValidatorEditForm
            line={editedLine} 
            setOpened={setOpened}
            linesToSave={localLines} 
            setLineToSave={setLocalLine}
            note={note}
            setViewedLine={setViewedLine}
        /> : <></>}
    </Modal>
}