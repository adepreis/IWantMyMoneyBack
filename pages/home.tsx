import { Button, Group, SegmentedControl, Center, Select } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { HiOutlineLogout, HiClock, HiXCircle, HiCheck } from "react-icons/hi";
import { getHomeNote, HomeNote, HomeNoteRequest } from './api/home'
import { useState, useEffect } from 'react'

type Props = {
  session: Session | null,
}

enum DataState {NONE, SENT_AND_WAITING, ERROR, VALID};
type Data = {label: string; state: DataState}
const segmentedData: Data[] = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map(month => {
  return {
    label: `${month}`,
    state: Math.random() > 0.5 ? DataState.NONE : 
      Math.random() > 0.5 ? DataState.SENT_AND_WAITING : 
      Math.random() > 0.5 ? DataState.ERROR : DataState.VALID
  }
})

export default function Home(props: Props) {
    const {session} = props;
    const [note, setNotes] = useState([] as HomeNote);

    useEffect(async () => {
      const result = await fetch("/api/home");
      const json = await result.json();
  
      setNotes(json);
    }, [setNotes]);

    console.log(props);

    // return <>
    //   <Button onClick={() => signOut()} size="md" leftIcon={
    //       <HiOutlineLogout />
    //   }>Se déconnecter</Button>
    // </>

    return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
      <Center>
        <p>Ma note de frais</p>
      </Center>
      <Group style={{flex: 0, width: "100%"}} spacing={0}>
        <Select
          placeholder="Année"
          data={[2022, 2023, 2024, 2025].map(year => { return {
              value: `${year}`,
              label: `${year}`
            }
          })}
          style={{
            flex: "unset"
          }}
        />
        <SegmentedControl style={{flex: 1}} fullWidth data={segmentedData.map(el => {
          var icon = <></>;
          switch (el.state) {
            case DataState.NONE:
              break;
            case DataState.SENT_AND_WAITING:
              icon = <HiClock />
              break;
            case DataState.ERROR:
              icon = <HiXCircle />
              break;
            case DataState.VALID:
              icon = <HiCheck />
              break;
          }
          return {
            value: el.label,
            label: (
              <Center>
                <div style={{ marginRight: 10 }}>{el.label}</div>
                {icon}
              </Center>
            ),
          }
        })} />
      </Group>
    </Group>
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
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
