import { Accordion, Center, Loader } from "@mantine/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMission } from "../../entity/mission.entity";
import { INoteDeFrais } from "../../entity/notedefrais.entity";
import { LineToSave, UILigne, UINote } from "../../pages/home/[params]";
import EditModal from "./EditModal";
import Line from "./Line";
import NoteButtons from "./NoteButton";

type NoteProps = {
    notes: INoteDeFrais[],
    note: UINote,
    setNote: Dispatch<SetStateAction<UINote>>,
    month: number,
    setMonth: Dispatch<SetStateAction<number>>,
    year: number,
    refreshProps: () => Promise<void>;
    edited: boolean;
    setEdited: Dispatch<SetStateAction<boolean>>;
    clearLocalState: boolean;
    setClearLocalState: Dispatch<SetStateAction<boolean>>;
}

type MissionData = {
    mission: IMission,
    lignes: UILigne[]
}

function getLinesPerMission(note: NonNullable<UINote>, localLines: LineToSave[]) {
    const missions = new Map<string, MissionData>();

    const lignes: UILigne[] = note.lignes.map(l => {
        return {
          ...l,
          UI: "default"
        }
    });

    const tempLines: UILigne[] = localLines.map(l => {
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

    return missions;
}

export default function Note(props: NoteProps) {
    const {note, notes, month, year, refreshProps, setMonth, setNote, setEdited, clearLocalState, setClearLocalState} = props;
    const [openedModal, setOpenedModal] = useState(false);
    const [editedLine, setEditedLine] = useState(null as UILigne | null);
    const [localLines, setLocalLines] = useState([] as LineToSave[])

    useEffect(() => {
        if (clearLocalState) {
            setLocalLines([]);
            setClearLocalState(false);
        }

        const edited = localLines.length > 0;
        if (edited !== props.edited) {
            setEdited(edited);
        }
    });

    if (!note) {
        return <Center style={{width: "100%", height: "100%"}}>
          <Loader />
        </Center>
    }
    
    const missionsLines = getLinesPerMission(note, localLines);

    return <>
        <EditModal 
            editedLine={editedLine} 
            note={note} 
            opened={openedModal} setOpened={setOpenedModal}
            localLines={localLines} setLocalLinse={setLocalLines}
        />
        <NoteButtons
            notes={notes} 
            note={note} 
            setOpenedModal={setOpenedModal} 
            setEditedLine={setEditedLine}
            month={month}
            setMonth={setMonth}
            year={year}
            refreshProps={refreshProps}
            setNote={setNote}
        />
        <Accordion offsetIcon={false} style={{width: "100%"}}>
        {
            Array.from(missionsLines).map((mission, key) => {
                return <Accordion.Item label={mission[1].mission.titre} key={key}>
                    <Line note={note} lines={mission[1].lignes} setOpenedModal={setOpenedModal}
                        localLines={localLines} setLocalLines={setLocalLines} setEditedLine={setEditedLine}/>
                </Accordion.Item>
            })
        }
        </Accordion>
    </>
}