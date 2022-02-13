import { Title, Text, Card, Avatar, UnstyledButton, Center, Grid, Group } from '@mantine/core'
import { HiClock, HiCheck } from "react-icons/hi";
import { NOTEDEFRAIS_ETAT } from '../../entity/utils'
import { INoteDeFrais } from "../../entity/notedefrais.entity";
import { useRouter } from 'next/router'

import dayjs from 'dayjs'
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/fr";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type CardNoteProps = {
    note: INoteDeFrais // Required<INoteDeFrais, "user"> ??
}

export default function CardNote(props: CardNoteProps) {
    const router = useRouter();
    const {id, mois, annee, etat, user} = props.note;

    const valid = etat === NOTEDEFRAIS_ETAT.VALIDEE;

    const color = valid ? "green" : "white";

    return <UnstyledButton>
      {/* Card examples : */}
      <Card padding="xl" shadow="sm" radius="md" withBorder={true}
        style={{ margin: 10, width: "10em", maxHeight: "10em", borderColor: color }}
        onClick={() => {
            router.push(router.pathname.replace("[params]", `note/${id}`))
        }}
      >
        <Card.Section>
            <Center>
                <Avatar size="lg" radius="xl" />
            </Center>
        </Card.Section>
        <Card.Section>
            {/* TO DEBUG : Why some note have undefined users (but no pb in db) ? */}
            <Title order={6}>
                {user
                    ? user.prenom + " " + user.nom
                    : "Utilisateur inconnu"
                }
            </Title>
        </Card.Section>
        <Card.Section>
        <Group direction="row" position="apart">
            <Text style={{ textTransform: "capitalize" }}>
                {dayjs(new Date(annee, mois)).format('MMMM YYYY')}
            </Text>
            { valid
                ? <HiCheck color={color} />
                : <HiClock />
            }
        </Group>
        </Card.Section>
      </Card>
    </UnstyledButton>
}
