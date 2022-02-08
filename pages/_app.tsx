import { AppShell, Header, MantineProvider, Navbar, Burger, Group, Image } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react"
import "reflect-metadata";
import SwitchUserMenu from '../components/SwitchUserMenu';
import '../styles/globals.scss';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [appMenuOpened, setAppMenuOpened] = useState(false);
  const mobile = useMediaQuery('(max-width: 768px)');

  const header = <Header height={75} padding="sm">
    <Group position="apart">
      <Group position="center" spacing="sm">
        {/* <Burger
          opened={appMenuOpened}
          onClick={() => setAppMenuOpened((o) => !o)}
          title="Test"
          style={{marginRight: "0.8rem"}}
        /> */}
        <Image src="/logo.svg" height={55} width={114} style={{
          filter: "invert(1)",
          marginTop: -5,
          marginBottom: -5
        }} alt="logo"/>
      </Group>
      <SwitchUserMenu/>
    </Group>
  </Header>;

  const navbar = appMenuOpened ? <Navbar padding="xs" width={{ base: mobile ? "100%" : 300 }} fixed>
      <Navbar.Section>Accueil</Navbar.Section>
      <Navbar.Section grow mt="lg">Lien 1</Navbar.Section>
      <Navbar.Section>{"Conditions d'utilisation"}</Navbar.Section>
  </Navbar> : <></>;

  return (
    <>
      <Head>
        <title>I Want My Money Back</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'dark',
        }}
      >
        <SessionProvider session={pageProps.session}>
          <NotificationsProvider>
            <ModalsProvider>
              <AppShell header={header} fixed styles={(theme) => ({
                main: {display: "flex", backgroundColor: theme.colors.dark[8], paddingLeft: 0},
              })} navbar={navbar}>
                <Component {...pageProps} />
              </AppShell>
            </ModalsProvider>
          </NotificationsProvider>
        </SessionProvider>
      </MantineProvider>
    </>
  );
}