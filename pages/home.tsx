import { Button, Group, SegmentedControl, Center, Select, Table, GroupedTransition, Container } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { getHomeNote, HomeNote, HomeNoteRequest } from './api/home'
import { useState, useEffect } from 'react'
import { HiOutlineLogout, HiClock, HiXCircle, HiCheck } from "react-icons/hi";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import { INoteDeFrais } from '../entity/notedefrais.entity'
import { NOTEDEFRAIS_ETAT } from '../entity/utils'
import numbro from 'numbro'
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type Props = {
  session: Session | null,
}

export default function Home(props: Props) {
  return <p>Loading</p>
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

  const currentYear = dayjs().year();

  return {
    redirect: {
      permanent: false,
      destination: `/home/${currentYear}`,
    },
    props: { session }
  }
}
