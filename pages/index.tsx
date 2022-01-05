import { Button } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signIn, signOut, useSession } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { HiOutlineLogin } from "react-icons/hi";

type Props = {
  session: Session | null,
}

export default function Home(props: Props) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          I Want My Money Back
        </h1>

        <div className={styles.grid} style={{marginTop: "1.75rem"}}>
          <Button onClick={() => signIn()} size="md" leftIcon={
            <HiOutlineLogin />
          }>Se connecter</Button>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/home",
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
