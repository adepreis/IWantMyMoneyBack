import { Title, Group, TextInput, Select, Chips, Chip } from "@mantine/core";
import { HiSearch } from "react-icons/hi";
import { Dispatch, SetStateAction } from "react";
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'


type ValidatorFiltersProps = {
    keyword: string,
    setKeyword: Dispatch<SetStateAction<string>>,
    sortStrategy: string,
    setSortStrategy: Dispatch<SetStateAction<string>>,
    filters: NOTEDEFRAIS_ETAT[],
    setFilters: Dispatch<SetStateAction<NOTEDEFRAIS_ETAT[]>>,
    year: number,
    onYearChange : (value: string) => Promise<void>,
    years: number[]
}

function getSelectData(yearList: number[]) {
    return Array.from(yearList).sort().map(year => { 
        return {
            value: `${year}`,
            label: `${year}`
        }
    })
}

export default function ValidatorFilters(props: ValidatorFiltersProps) {

    return <Group direction="column" style={{height: "100%", maxWidth: "20%"}} spacing="md">
        <Title order={4}>Filtres</Title>
        <TextInput disabled
            placeholder="Rechercher"
            icon={<HiSearch />}
            value={props.keyword}
            onChange={(event) => props.setKeyword(event.currentTarget.value)}
        />
        <Select disabled
            label="Trier par :"
            // placeholder="Pick one"
            defaultValue={props.sortStrategy}
            onChange={(value) => props.setSortStrategy(value as string)} // setSortStrategy}
            data={[
                { value: 'date_ascending', label: 'Date de dépot (croissant)' },
                { value: 'date_descending', label: 'Date de dépot (décroissant)' },
                { value: 'alphabet_order', label: 'Ordre alphabétique' },
                { value: 'alphabet_reverse', label: 'Ordre alphabétique inverse' },
                ]}
            />
        <Select
            placeholder="Année"
            data={getSelectData(props.years)}
            value={props.year ? `${props.year}` : null}
            onChange={(value: string) => props.onYearChange(value)}
            style={{ flex: "unset" }}
        />
        <Chips value={props.filters} onChange={props.setFilters}
            multiple variant="filled" direction="column">
            <Chip value={NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION}>Non traitées</Chip>
            <Chip value={NOTEDEFRAIS_ETAT.VALIDEE}>Validées</Chip>

            {/*<Chip value="pending">En cours de validation</Chip>
            <Chip value="todo">Non traitées</Chip>
            <Chip value="valid">Validées</Chip>*/}
        </Chips>
    </Group>
}