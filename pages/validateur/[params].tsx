import { Group } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
// import { useRouter } from 'next/router'
// import { useEffect, useState } from 'react'
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
  // const router = useRouter();

  return <Group grow direction="column" style={{width: "100%"}} spacing={0}>
    <p>🚧 <strong>WIP</strong> 🚧<br/>🚧 Ceci sera la future page validateur 🚧</p>
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