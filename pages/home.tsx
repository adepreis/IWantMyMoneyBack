import { Button } from '@mantine/core'
import type { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import styles from '../styles/Home.module.scss'
import { HiOutlineLogout } from "react-icons/hi";

type Props = {
  session: Session | null,
}

export default function Home(props: Props) {
    const {session} = props;

    return <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          I Want My Money Back
        </h1>

        <div className={styles.grid} style={{display: "flex", flexDirection: "column", marginTop: "1.75rem"}}>
            <span style={{display: "block", paddingBottom: "1rem"}}>
                Bonjour <strong>{session?.user?.email}</strong>,
            </span>
            <Button onClick={() => signOut()} size="md" leftIcon={
                <HiOutlineLogout />
            }>Se déconnecter</Button>
        </div>
      </main>
    </div>;
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
