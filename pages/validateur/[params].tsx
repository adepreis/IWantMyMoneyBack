import { Group, Alert, Select, Accordion } from '@mantine/core'
import { HiOutlineSearchCircle } from "react-icons/hi";
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
// import { getValidatorNote, ValidatorNote } from '../api/home'
import { INoteDeFrais } from '../../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import ValidatorFilters from '../../components/validateur/ValidatorFilters'
import CardNote from '../../components/validateur/CardNote'
import { Routes } from '../../utils/api'

import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

export interface ValidatorProps {
    session: Session | null
}

export default function Validator(props: ValidatorProps) {
    const router = useRouter();

    // array of strings value when multiple is true
    const [query, setQuery] = useState('');
    // const [queryHasResult, setQueryHasResult] = useState(true);
    const [sortStrategy, setSortStrategy] = useState('date_ascending');
    const [filters, setFilters] = useState([NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION]);

    const [notes, setNotes] = useState([] as INoteDeFrais[]);

    const [year, setYear] = useState(parseInt(router.query.params as string));
    const [years, setYears] = useState([] as number[]);

    const onYearChange = async (updatedYear: string) => {
        console.log("New value : " + updatedYear);

        const action = async () => {
            console.log(year);
            setYear(parseInt(updatedYear as string));
            console.log(year);
            await router.push(`/validateur/${updatedYear}`);
        }

        await action();
        // await updateNotesState();
    }

    const updateNotesState = async () => {
        const res = await Routes.VALIDATEUR.get();
        /* TODO: handle res==null ? */

        setYearsState(res);

        console.log("Update " + year + " notes")

        const filteredNotes = res.filter((note: INoteDeFrais, noteIndex: number) => {
            return (note.annee === year) &&
                    (note.etat === NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ||
                    note.etat === NOTEDEFRAIS_ETAT.VALIDEE);
        })

        setNotes(filteredNotes);
    }

    const setYearsState = (res: INoteDeFrais[]) => {
        const allYears = res.map(note => note.annee);

        setYears(Array.from(new Set(allYears)));
    }

    useEffect(() => {
        updateNotesState();
    }, []);

    useEffect(() => {
        if (notes.length > 0 && notes[0].annee !== year) {
            updateNotesState();
        }
    });

    // No notes if no filter...
    const filteredNotes: INoteDeFrais[] = notes.filter(note => filters.includes(note.etat));


    return <Group grow direction="row" style={{width: "100%", margin: 20}}>
        <ValidatorFilters keyword={query}
            setKeyword={setQuery}
            sortStrategy={sortStrategy}
            setSortStrategy={setSortStrategy}
            filters={filters}
            setFilters={setFilters}
            year={year}
            onYearChange={onYearChange}
            years={years} />

        {/* TO FIX : ON SMALLER DEVICES, A HUGE GAP APPEARS "HERE" */}

        <Group direction="column" style={{height: "100%", maxWidth: "80%"}} spacing="sm" position="center">
            {/* TODO: set hidden attribute according to a state "queryHasResult" */}
            <Alert hidden={false} icon={<HiOutlineSearchCircle size={25} />}
            title="TODO: conditional alert" color="gray" radius="md" variant="filled">
            Aucune note ne correspond au critères de recherche que vous avez entrés.
            </Alert>


            <Accordion offsetIcon={false} style={{width: "100%"}}>
                {/*
                const currentYearNotes = notes.filter((note: INoteDeFrais, noteIndex: number) => {
                    return (note.year === year);
                  }
                )}
                // TODO: iterate on (existing ?) months :
                const monthsWithNotes = dayjs.months().map((month, monthIndex) => {

                  return {...}
                });

                currentYearNotes.map((note, key) => {
                    return ...
                */}
                {
                    Array.from(new Set(filteredNotes.map(note => note.mois))).sort((a, b) => a-b).map((month, key) => {
                        return <Accordion.Item label={dayjs(new Date(year, month)).format('MMMM YYYY')} key={key}>
                            <Group direction="row" style={{width: "90%", margin: 25}}>
                                { filteredNotes.filter(note => note.mois === month).map((note: INoteDeFrais, noteIndex: number) => {
                                    // TODO: apply filters ('pending', 'todo', 'valid')
                                    // TODO: order by sortStrategy
                                    // TODO: find keyword (+ toogle "queryHasResult" state ?)
                                    return <CardNote key={noteIndex} note={note}/>
                                })
                            }
                            </Group>
                         </Accordion.Item>
                        })
                }
            </Accordion>
        </Group>
    </Group>
}

export const getServerSideProps: GetServerSideProps<ValidatorProps> = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {session}
        }
    }

    return {
        props: {
            session
        },
    }
}