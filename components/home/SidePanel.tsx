import { Group, Text, Image, useMantineTheme, MantineTheme, Title } from "@mantine/core";
import { HiOutlineInformationCircle, HiOutlineXCircle } from "react-icons/hi";
import { UILigne } from "../../pages/home/[params]";
import { TempLigneDeFrais } from "../EditLineForm";

type SidePanelProps = {
    viewedLine: UILigne | null;
}

export function renderLineFile(line: NonNullable<UILigne>, theme: MantineTheme) {
    const {justificatif} = line;

    const files = (line as TempLigneDeFrais)?.files ?? [];
    const tempFile = files.find(f => f.name === justificatif);

    const fileURL = justificatif !== "" ? justificatif.includes("http") ? 
        justificatif : `/justificatif/${justificatif}` : ""

    var content = <Group position="center" spacing={7}>
        <HiOutlineXCircle style={{fontSize: "1.2rem"}}/>
        <Text>{"Le type de fichier n'est pas supporté !"}</Text>
    </Group>;

    if ([".png", ".jpeg", ".jpg"].some(fileType => fileURL.includes(fileType))) {
        content = <Image
            src={tempFile ? URL.createObjectURL(tempFile) : fileURL}
            width="100%"
            height="auto"
            style={{width: "100%"}}
            alt="Justificatif"
        />
    }
    else if (fileURL.includes(".pdf")) {
        content = <iframe 
            src={tempFile ? URL.createObjectURL(tempFile) : fileURL}
            style={{
                width: "100%",
                height: "30vh",
                border: "0"
            }}
        ></iframe>
    }
    else if (fileURL === "") {
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
        {renderLineFile(viewedLine, theme)}
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