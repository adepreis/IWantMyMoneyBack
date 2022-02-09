import { Accordion, Center, Grid, Loader, Group } from "@mantine/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMission } from "../../entity/mission.entity";
import { INoteDeFrais } from "../../entity/notedefrais.entity";
import { UILigne, UINote } from "../../pages/home/[params]";
import { TempLigneDeFrais } from "../EditLineForm";
import EditModal from "./EditModal";
import Line from "./Line";
import NoteButtons from "./NoteButton";
import { SidePanel } from "./SidePanel";

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

function getLinesPerMission(note: NonNullable<UINote>, localLines: UILigne[]) {
    const missions = new Map<string, MissionData>();

    const lignes: UILigne[] = note.lignes.map(l => {
        return {
          ...l,
          UI: "default"
        }
    });

    for (const ligne of lignes.concat(localLines)) {
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
    const [viewedLine, setViewedLine] = useState(null as UILigne | null);
    const [editedLine, setEditedLine] = useState(null as UILigne | null);
    const [localLines, setLocalLines] = useState([] as UILigne[])

    useEffect(() => {
        if (clearLocalState) {
            setLocalLines([]);
            setClearLocalState(false);
        }

        const edited = localLines.length > 0;
        if (edited !== props.edited) {
            setEdited(edited);
        }

        if (viewedLine && !((
            (note && note.lignes.find(l => l.id === viewedLine.id)) ||
            (localLines.find(l => l.id === viewedLine.id))
        ))) {
            setViewedLine(null);
        } else if (viewedLine && edited && localLines.find(l => l.id === viewedLine.id && l.justificatif !== viewedLine.justificatif)) {
            setViewedLine(localLines.find(l => l.id === viewedLine.id) ?? null);
        } else if (viewedLine && !edited && note?.lignes?.find(l => l.id === viewedLine.id && l.justificatif !== viewedLine.justificatif)) {
            setViewedLine(null);
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
        <Grid grow style={{width: "100%", height: "100%"}}>
            <Grid.Col span={8}>
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
                            <Line note={note} lines={mission[1].lignes} setOpenedModal={setOpenedModal} setViewedLine={setViewedLine}
                                localLines={localLines} setLocalLines={setLocalLines} setEditedLine={setEditedLine} viewedLine={viewedLine}/>
                        </Accordion.Item>
                    })
                }
                </Accordion>
            </Grid.Col>
            <Grid.Col span={4}>
                <SidePanel viewedLine={viewedLine} />
            </Grid.Col>
        </Grid>
    </>
}