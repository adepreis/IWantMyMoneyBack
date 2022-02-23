import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
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
