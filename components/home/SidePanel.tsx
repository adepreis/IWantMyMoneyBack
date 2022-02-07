import { Group, Text, Image, useMantineTheme, MantineTheme, Title } from "@mantine/core";
import { HiOutlineInformationCircle, HiOutlineXCircle } from "react-icons/hi";
import { UILigne } from "../../pages/home/[params]";

type SidePanelProps = {
    viewedLine: UILigne | null;
}

const randomURL = "https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80";

function renderViewedLineFile(line: NonNullable<UILigne>, theme: MantineTheme) {
    const {justificatif} = line;

    var content = <Group position="center" spacing={7}>
        <HiOutlineXCircle style={{fontSize: "1.2rem"}}/>
        <Text>{"Le type de fichier n'est pas supporté !"}</Text>
    </Group>;

    if ([".png", ".jpeg", ".jpg"].some(fileType => justificatif.includes(fileType))) {
        content = <Image
            src={randomURL}
            width="100%"
            height="auto"
            style={{width: "100%"}}
            alt="Justificatif"
        />
    }
    else if (justificatif.includes(".pdf")) {
        content = <iframe 
            src="http://www.africau.edu/images/default/sample.pdf"
            style={{
                width: "100%",
                height: "30vh",
                border: "0"
            }}
        ></iframe>
    }
    else if (justificatif === "") {
        content = <Group position="center" spacing={7}>
            <HiOutlineXCircle style={{fontSize: "1.2rem", color: theme.colors.red[6]}}/>
            <Text color={theme.colors.red[6]}>{"Aucun justificatif n'a été fournis."}</Text>
        </Group>
    }

    return <>
        <Title order={3}>Justificatif</Title>
        {content}
    </>
}

export function SidePanel(props: SidePanelProps) {
    const { viewedLine } = props;
    const theme = useMantineTheme();

    const content = viewedLine ? <>
        {renderViewedLineFile(viewedLine, theme)}
    </> : <Group  position="center" spacing={7}>
        <HiOutlineInformationCircle style={{fontSize: "1.2rem"}}/>
        <Text>{"Aucune ligne n'a été selectionnée !"}</Text>
    </Group>

    return <Group style={{
        borderLeft: "solid 1px #373A40", 
        height: "100%",
        width: "100%",
        justifyContent: !viewedLine ? "center" : "",
        alignItems: !viewedLine ? "center" : "",
        padding: "0rem 0rem 0rem 1rem"
    }} direction="column">
        {content}
    </Group>;
}