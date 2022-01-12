import { Button, Center, Container, PasswordInput, TextInput } from "@mantine/core";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { Provider } from "next-auth/providers"
import { getProviders, getSession, getCsrfToken, useSession } from "next-auth/react"
import { useState } from "react";

export default function SignIn({ providers, csrfToken }: {providers: Provider[], csrfToken?: string}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { data: session, status } = useSession()
    
    return <>
        <Container style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <Center>
                {Object.values(providers).map((provider, index) => {
                    return <form id="signInForm" key={index} method="post" action={(provider as any)?.callbackUrl}>
                        <input name="csrfToken" type="hidden" defaultValue={csrfToken as string} />
                        <TextInput
                            id="emailInput"
                            name="email"
                            placeholder="Email"
                            label="Email"
                            required
                            value={email} onChange={(event) => setEmail(event.currentTarget.value)}
                        />
                        <PasswordInput
                            id="passwordInput"
                            name="password"
                            placeholder="Mot de passe"
                            label="Mot de passe"
                            required
                            value={password} onChange={(event) => setPassword(event.currentTarget.value)}
                        />
                        <Button onClick={() => {
                            const form = document.getElementById("signInForm");
                            if (form) {
                                (form as any)?.submit();
                            }
                        }}>Se connecter</Button>
                    </form>
                })}
            </Center>
        </Container>
    </>
}

// Export the `session` prop to use sessions with Server Side Rendering
export const getServerSideProps: GetServerSideProps<{
    session: Session | null,
    csrfToken?: string,
}> = async (context) => {
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

    const providers = await getProviders();
    const csrf = await getCsrfToken(context);
    return {
      props: {
        session,
        providers,
        csrfToken: csrf,
      },
    }
}