import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { USER_ROLES } from '../entity/user.entity'

import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type Props = {
  session: Session | null,
}

export default function Validator(props: Props) {
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
      props: { session }
    }
  }

  if (session.role !== USER_ROLES.CHEF_DE_SERVICE) {

    return {
      redirect: {
        permanent: false,
        destination: `/home`,
      },
      props: { session }
    }
  }

  const currentYear = dayjs().year();

  return {
    redirect: {
      permanent: false,
      destination: `/validateur/${currentYear}`,
    },
    props: { session }
  }
}
