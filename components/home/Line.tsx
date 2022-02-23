import { MantineTheme, Table, useMantineTheme, Text, Button, Title } from "@mantine/core";
import { CSSProperties, Dispatch, SetStateAction } from "react";
import { HiDocumentAdd, HiTrash, HiOutlinePencil, HiOutlinePaperClip, HiCheck, HiOutlineX } from "react-icons/hi";
import { UILigne, UINote } from "../../pages/home/[params]";
import dayjs from 'dayjs'
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import numbro from "numbro";
import { LIGNEDEFRAIS_ETAT, NOTEDEFRAIS_ETAT, USER_ROLES } from "../../entity/utils";
import LineButtons from "./LineButton";
import { ILigneDeFrais } from "../../entity/lignedefrais.entity";
dayjs.extend(localeData);
dayjs().format();
dayjs.locale("fr");

type LineProps = {
    note: NonNullable<UINote>;
    lines: UILigne[];
    localLines: UILigne[];
    setLocalLines: Dispatch<SetStateAction<UILigne[]>>;
    setEditedLine: Dispatch<SetStateAction<UILigne | null>>;
    setOpenedModal: Dispatch<SetStateAction<boolean>>;
    viewedLine: UILigne | null;
    setViewedLine: Dispatch<SetStateAction<UILigne | null>>;
    mode: USER_ROLES;
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

function getLineValidationIcon(line: ILigneDeFrais, theme: MantineTheme) {
    var icon = <></>;
    switch (line.etat) {
        case LIGNEDEFRAIS_ETAT.VALIDEE:
            icon = <HiCheck color={theme.colors.green[6]} size="1.25rem"/>
            break;
        case LIGNEDEFRAIS_ETAT.REFUSEE:
            icon = <HiOutlineX color={theme.colors.red[6]} size="1.25rem" />
            break;
    }
    return icon;
}

function getUIStateTableElement(mode: USER_ROLES, edited: boolean, line: UILigne, theme: MantineTheme): [JSX.Element, CSSProperties] {
    if (mode === USER_ROLES.USER) {
        if (edited) {
            if (line.UI === "default") {
                // This line has not been edited, so it's an ILigneDeFrais (default UI state)
                const l = line as ILigneDeFrais;
                return  [
                    <td key={0} style={{lineHeight: "0.25rem"}}>
                        {getLineValidationIcon(l, theme)}
                    </td>,
                    {
                        color: l.etat === LIGNEDEFRAIS_ETAT.VALIDEE ? theme.colors.green[6] :
                            l.etat === LIGNEDEFRAIS_ETAT.REFUSEE ?  theme.colors.red[6] : ""
                    }
                ]
            } else {
                // This line must have been edited, it's a TempLigne
                return [
                    <td key={0} style={{lineHeight: "0.25rem"}}>
                        {getUIStateIcon(line, theme)}
                    </td>, {
                    color: line.UI === "post" ? theme.colors.green[6] : 
                        line.UI === "delete" ? theme.colors.red[6] : 
                        line.UI === "put" ? theme.colors.yellow[6] : ""
                }]
            }
        } else {
            // Note has not been edited, every line are ILigneDeFrais
            const l = line as ILigneDeFrais;
            return  [
                <td key={0} style={{lineHeight: "0.25rem"}}>
                    {getLineValidationIcon(l, theme)}
                </td>,
                {
                    color: l.etat === LIGNEDEFRAIS_ETAT.VALIDEE ? theme.colors.green[6] :
                        l.etat === LIGNEDEFRAIS_ETAT.REFUSEE ?  theme.colors.red[6] : ""
                }
            ]
        }
    } else if (mode === USER_ROLES.CHEF_DE_SERVICE) {
        // Note has been edited by validator, every line are ILigneDeFrais
        const l = line as ILigneDeFrais;
        return  [
            <td key={0} style={{lineHeight: "0.25rem"}}>
                {getLineValidationIcon(l, theme)}
            </td>,
            {
                color: l.etat === LIGNEDEFRAIS_ETAT.VALIDEE ? theme.colors.green[6] :
                    l.etat === LIGNEDEFRAIS_ETAT.REFUSEE ?  theme.colors.red[6] : ""
            }
        ]
    }

    return [<></>, {}];
}

export default function Line(props: LineProps) {
    const {note, lines, localLines, viewedLine, mode} = props;
    const theme = useMantineTheme();
    
    const edited = localLines.length !== 0;

    const filter = mode === USER_ROLES.USER ?
        (line: UILigne) => !(line.UI === "default" && localLines.find(l => ["put", "delete"].includes(l.UI) && l.id === line.id)) :
        (line: UILigne) => !(line.UI === "default" && localLines.find(l => l.id === line.id))
        
    // var editedSpace = false;
    const rows = lines.filter(filter).map((line, index) => {
        const [stateHead, rowStyle] = getUIStateTableElement(mode, edited, line, theme);

        // var space = <></>;

        // if (edited && !editedSpace && line.UI !== "default") {
        //     space = <tr key={`${index}-1`}>
        //         <Title>Ligne(s) éditée(s):</Title>
        //     </tr>
        //     editedSpace = true;
        // }

        // return [space, <tr key={`${index}-0`} onClick={() => { props.setViewedLine(line) }} style={{
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
                mode={mode}
            />
        {/* </tr>] */}
        </tr>
    });

    const action = mode === USER_ROLES.USER && 
        note.etat !== NOTEDEFRAIS_ETAT.VALIDEE && note.etat !== NOTEDEFRAIS_ETAT.EN_ATTENTE_DE_VALIDATION ?
        <th>Action</th> :
        mode === USER_ROLES.CHEF_DE_SERVICE ? <th>Action</th> : <></>;

    return <Table striped highlightOnHover>
        <thead>
            <tr>
                <th>Etat</th>
                <th>Titre</th>
                <th>Date</th>
                <th>Montant HT</th>
                <th>Justificatif</th>
                {action}
            </tr>
        </thead>
        <tbody>{rows}</tbody>
    </Table>;
}