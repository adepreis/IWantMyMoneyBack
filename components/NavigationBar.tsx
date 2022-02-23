import { Group, SegmentedControl, Center, Select, Text, ScrollArea } from '@mantine/core';
import router from 'next/router';
import { Dispatch, SetStateAction, Props } from 'react';
import { HiClock, HiXCircle, HiCheck } from 'react-icons/hi';
import { RiDraftLine } from 'react-icons/ri';
import { NOTEDEFRAIS_ETAT } from '../entity/utils';
import { HomeProps, UINote } from "../pages/home/[params]";
import dayjs from 'dayjs'
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/fr";
import { INoteDeFrais } from '../entity/notedefrais.entity';
import { useModals } from '@mantine/modals';
import { ModalsContext } from '@mantine/modals/lib/context';
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

interface NavigationProps extends HomeProps {
    year: number,
    month: number,
    setMonth: Dispatch<SetStateAction<number>>,
    setNote: Dispatch<SetStateAction<UINote>>,
    updateNoteState: (month: number) => Promise<void>,
    edited: boolean
    setClearLocalState: Dispatch<SetStateAction<boolean>>,
}

function getSelectData(props: NavigationProps) {
    return (props?.years ?? []).map(year => { 
        return {
            value: `${year}`,
            label: `${year}`
        }
    })
}

function preventPageChangeWithEditedNote(props: NavigationProps, modals: ModalsContext, action: () => Promise<void>): boolean {
    const {edited, setClearLocalState} = props;

    if (!edited) return false;

    modals.openConfirmModal({
        title: "Perte des modifications",
        centered: true,
        children: (
            <Text size="sm">
                {"Vos modifications n'ont pas été sauvegardée. Êtes-vous sûr de vouloir changer de page ?"}
            </Text>
        ),
        labels: { confirm: 'Suppression des modifications', cancel: "Annuler" },
        confirmProps: { color: 'red' },
        onCancel: () => {},
        onConfirm: () => {
            action();
            setClearLocalState(true);
        }
    });
    return true;  
}

async function onYearChange(props: NavigationProps, item: string, modals: ModalsContext) {
    const {setMonth, setNote, updateNoteState, edited} = props;

    const action = async () => {
        setMonth(0);
        setNote(null);
        await router.push(`/home/${item}`);
        updateNoteState(-1);
    }

    if (preventPageChangeWithEditedNote(props, modals, action)) return;

    // If not edited
    await action();
}

async function onMonthChange(props: NavigationProps, item: string, modals: ModalsContext) {
    const {setMonth, setNote, updateNoteState, edited} = props;

    const action = async () => {
        setNote(null);
        const month = parseInt(item);
        setMonth(month);
        await updateNoteState(month);
    }

    if (preventPageChangeWithEditedNote(props, modals, action)) return;

    // If not edited
    action();
}

function getSegmentedData(props: NavigationProps) {
    const monthData = dayjs.months().map((month, monthIndex) => {
        const monthNote: INoteDeFrais | null = props.notes ? (props.notes.find(note => note.mois === monthIndex) ?? null) : null;
  
        return {
            label: `${month}`,
            state: !monthNote ? null : monthNote.etat,
            index: monthIndex
        }
    })

    return monthData.map(el => {
        var icon = <></>;    // To replace by a Tooltip with label=title ?
        switch (el.state) {
            case NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION:
                icon = <HiClock title="En attente de validation"/>
                break;
            case NOTEDEFRAIS_ETAT.REFUSEE:
                icon = <HiXCircle title="Note refusée"/>
                break;
            case NOTEDEFRAIS_ETAT.VALIDEE:
                icon = <HiCheck title="Note validée"/>
                break;
            case NOTEDEFRAIS_ETAT.BROUILLON:
                icon = <RiDraftLine title="En cours d'édition"/>
                break;
        }
        return {
            value: `${el.index}`,
            label: (
                <Center>
                    <div style={{ marginRight: 10, textTransform: "capitalize" }}>{el.label}</div>
                    {icon}
                </Center>
            ),
        }
    });
}

export default function NavigationBar(props: NavigationProps) {
    const { month, year } = props;
    const modals = useModals();

    return <Group style={{flex: 0, width: "100%"}} spacing={0}>
        <Select
            placeholder="Année"
            data={getSelectData(props)}
            value={props.year ? `${year}` : null}
            onChange={(item: string) => onYearChange(props, item, modals)}
            style={{ flex: "unset" }}
        />
        <ScrollArea style={{flex: 1}}>
            <SegmentedControl 
                value={`${month}`}
                onChange={(item: string) => onMonthChange(props, item, modals)} 
                fullWidth 
                data={getSegmentedData(props)}
            />
        </ScrollArea>
    </Group> 
}