import { Group, SegmentedControl, Center, Select } from '@mantine/core';
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
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

interface NavigationProps extends HomeProps {
    year: number,
    month: number,
    setMonth: Dispatch<SetStateAction<number>>,
    setNote: Dispatch<SetStateAction<UINote>>,
    updateNoteState: (month: number) => Promise<void>
}

function getSelectData(props: NavigationProps) {
    return (props?.years ?? []).map(year => { 
        return {
            value: `${year}`,
            label: `${year}`
        }
    })
}

async function onYearChange(props: NavigationProps, item: string) {
    const {setMonth, setNote, updateNoteState} = props;

    setMonth(0);
    setNote(null);
    await router.push(`/home/${item}`);
    updateNoteState(-1);
}

async function onMonthChange(props: NavigationProps, item: string) {
    const {setMonth, setNote, updateNoteState} = props;

    setNote(null);
    const month = parseInt(item);
    setMonth(month);
    await updateNoteState(month);
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
        var icon = <></>;
        switch (el.state) {
            case NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION:
                icon = <HiClock />
                break;
            case NOTEDEFRAIS_ETAT.REFUSEE:
                icon = <HiXCircle />
                break;
            case NOTEDEFRAIS_ETAT.VALIDEE:
                icon = <HiCheck />
                break;
            case NOTEDEFRAIS_ETAT.BROUILLON:
                icon = <RiDraftLine />
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
    const { month, year, setMonth } = props;
    return <Group style={{flex: 0, width: "100%"}} spacing={0}>
        <Select
            placeholder="Année"
            data={getSelectData(props)}
            value={props.year ? `${year}` : null}
            onChange={(item: string) => onYearChange(props, item)}
            style={{ flex: "unset" }}
        />
        <SegmentedControl 
            style={{flex: 1}}
            value={`${month}`}
            onChange={(item: string) => onMonthChange(props, item)} 
            fullWidth 
            data={getSegmentedData(props)}
        />
    </Group> 
}