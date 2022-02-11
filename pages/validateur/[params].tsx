import { Group, Title, Text, Card, Chips, Chip, Avatar, TextInput, Select } from '@mantine/core'
import { HiSearch, HiClock, HiCheck } from "react-icons/hi";
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
// import { getValidatorNote, ValidatorNote } from '../api/home'
// import { INoteDeFrais } from '../../entity/notedefrais.entity'
// import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
// import { ILigneDeFrais } from '../../entity/lignedefrais.entity'
// import Note from '../../components/home/Note'
// import { Routes } from '../../utils/api'

export interface ValidatorProps {
  session: Session | null
}

export default function Validator(props: ValidatorProps) {
  const router = useRouter();
  // array of strings value when multiple is true
  const [value, setValue] = useState(['pending', 'todo'])
  const [filterBy, setFilter] = useState('date_ascending');

  return <Group grow direction="row" style={{width: "100%", margin: 20}}>
    <Group direction="column" style={{height: "100%", maxWidth: "20%"}} spacing="md">
      <Title order={4}>Filtres</Title>
      <TextInput
        placeholder="Rechercher"
        icon={<HiSearch />}
      />
      <Select
        label="Trier par :"
        // placeholder="Pick one"
        defaultValue={filterBy}
        data={[
          { value: 'date_ascending', label: 'Date de dépot (croissant)' },
          { value: 'date_descending', label: 'Date de dépot (décroissant)' },
          { value: 'alphabet_order', label: 'Ordre alphabétique' },
          { value: 'alphabet_reverse', label: 'Ordre alphabétique inverse' },
        ]}
      />
      <Chips value={value} onChange={setValue}
        multiple variant="filled" direction="column">
        <Chip value="pending">En cours de validation</Chip>
        <Chip value="todo">Non traitées</Chip>
        <Chip value="valid">Validées</Chip>
      </Chips>
    </Group>
    <Group direction="column" style={{height: "100%", maxWidth: "80%"}} spacing="sm">
      <Text>🚧 Ceci sera la future page validateur / Texte si recherche infructueuse 🚧</Text>
    {/* Card examples : */}
      <Card style={{ margin: 10, width: "8em", maxHeight: "8em", borderColor: "white" }}
        component="a" padding="xl" shadow="sm" radius="md" withBorder={true}
        href={router.pathname.replace("[params]", "note/123456789")}
      >
        <Card.Section><Avatar size="lg" radius="xl" /><HiClock /></Card.Section>
        <Card.Section><Title order={5}>Prénom Nom</Title></Card.Section>
        <Card.Section><Text>Mois Année</Text></Card.Section>
      </Card>

      <Card style={{ margin: 10, width: "8em", maxHeight: "8em", borderColor: "green" }}
        component="a" padding="xl" shadow="sm" radius="md" withBorder={true}
        href={router.pathname.replace("[params]", "note/123456789")}
      >
        <Card.Section><Avatar size="lg" radius="xl" /><HiCheck color="green" /></Card.Section>
        <Card.Section><Title order={5}>Prénom Nom</Title></Card.Section>
        <Card.Section><Text>Mois Année</Text></Card.Section>
      </Card>

      <Card style={{ margin: 10, width: "8em", maxHeight: "8em", borderColor: "green" }}
        component="a" padding="xl" shadow="sm" radius="md" withBorder={true}
        href={router.pathname.replace("[params]", "note/123456789")}
      >
        <Card.Section><Avatar size="lg" radius="xl" /><HiCheck color="green" /></Card.Section>
        <Card.Section><Title order={5}>Prénom Nom</Title></Card.Section>
        <Card.Section><Text>Mois Année</Text></Card.Section>
      </Card>
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