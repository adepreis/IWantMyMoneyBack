import { MantineTheme, Table, useMantineTheme, Text, Button } from "@mantine/core";
import { CSSProperties, Dispatch, SetStateAction } from "react";
import { HiDocumentAdd, HiTrash, HiOutlinePencil, HiOutlinePaperClip } from "react-icons/hi";
import { LineToSave, UILigne, UINote } from "../../pages/home/[params]";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import numbro from "numbro";
import { NOTEDEFRAIS_ETAT } from "../../entity/utils";
import LineButtons from "./LineButton";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type LineProps = {
    note: NonNullable<UINote>;
    lines: UILigne[];
    localLines: LineToSave[];
    setLocalLines: Dispatch<SetStateAction<LineToSave[]>>;
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>;
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    viewedLine: UILigne | null;
    setViewedLine: Dispatch<SetStateAction<UILigne | null>>;
}

function getUIStateIcon(line: UILigne, theme: MantineTheme) {
    var icon = <></>;
    switch (line.UI) {
        case "post":
            icon = <HiDocumentAdd color={theme.colors.green[6]} size="1.25rem"/>
            break;
        case "delete":
            icon = <HiTrash color={theme.colors.red[6]} size="1.25rem" />
            break;
        case "put":
            icon = <HiOutlinePencil color={theme.colors.yellow[6]} size="1.25rem" />
            break;
    }
    return icon;
}

function getUIStateTableElement(edited: boolean, line: UILigne, theme: MantineTheme): [JSX.Element, CSSProperties] {
    return edited ? [
        <td key={0} style={{lineHeight: "0.25rem"}}>
            {getUIStateIcon(line, theme)}
        </td>, {
        color: line.UI === "post" ? theme.colors.green[6] : 
            line.UI === "delete" ? theme.colors.red[6] : 
            line.UI === "put" ? theme.colors.yellow[6] : ""
    }] : [<></>, {}]
}

export default function Line(props: LineProps) {
    const {note, lines, localLines, viewedLine} = props;
    const theme = useMantineTheme();
    
    const edited = localLines.length !== 0;

    const rows = lines.filter(line => !(line.UI === "default" && localLines.find(l => ["put", "delete"].includes(l.action) && l.line.id === line.id))).map((line, index) => {
        const [stateHead, rowStyle] = getUIStateTableElement(edited, line, theme);

        return <tr key={index} onClick={() => { props.setViewedLine(line) }} style={{
            ...rowStyle,
            cursor: "pointer",
            outline: viewedLine && viewedLine.id === line.id ? "solid 2px" : ""
        }}>
            {stateHead}
            <td>{line.titre}</td>
            <td>{dayjs(line.date).format("DD-MM-YYYY")}</td>
            <td>{numbro(line.prixHT).formatCurrency({ mantissa: 2, 
                currencySymbol: "€", 
                currencyPosition: "postfix",
                spaceSeparated: true,
                spaceSeparatedCurrency: true,
                thousandSeparated: true,
                }).replace(",", " ")}
            </td>
            <td>
                { line.perdu ? <Text style={{color: theme.colors.red[6]}}>Pas de justificatif</Text> : 
                    <Button title="TODO: afficher ligne.justificatif" variant="subtle" rightIcon={<HiOutlinePaperClip size={16}/>}>Justificatif</Button>}
            </td>
            <LineButtons 
                line={line} 
                localLines={localLines}
                setLocalLines={props.setLocalLines}
                noteState={note.etat} 
                setEditedLine={props.setEditedLine} 
                setOpenedModal={props.setOpenedModal}
            />
        </tr>
    });

    return <Table striped highlightOnHover>
        <thead>
            <tr>
                {edited ? <th>Etat</th> : <></>}
                <th>Titre</th>
                <th>Date</th>
                <th>Montant HT</th>
                <th>Justificatif</th>
                {note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ? 
                    <th>Action</th> : <></>}
            </tr>
        </thead>
        <tbody>{rows}</tbody>
    </Table>;
}