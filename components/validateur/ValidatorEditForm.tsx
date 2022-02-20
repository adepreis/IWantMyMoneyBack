import { useMantineTheme, Loader, LoadingOverlay, RadioGroup, Radio, Space, TextInput, Group, Select, NumberInput, Checkbox, Textarea, Button, Title } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useNotifications } from "@mantine/notifications";
import { Dispatch, SetStateAction, useState } from "react";
import { ILigneDeFrais } from "../../entity/lignedefrais.entity";
import { INoteDeFrais } from "../../entity/notedefrais.entity";
import { LIGNEDEFRAIS_ETAT, LIGNE_TYPE } from "../../entity/utils";
import { UILigne, EmptyNote } from "../../pages/home/[params]";
import { renderComment } from "../home/SidePanel";

type LineFormProps = {
  	line: UILigne | null,
  	setOpened: React.Dispatch<React.SetStateAction<boolean>>,
  	linesToSave: UILigne[],
  	setLineToSave: React.Dispatch<React.SetStateAction<UILigne[]>>,
  	note: INoteDeFrais | EmptyNote,
	setViewedLine: Dispatch<SetStateAction<UILigne | null>>
}

export default function ValidatorEditForm(props: LineFormProps) {
    const {line} = props;

	const notifications = useNotifications();
  	const [loading, setLoading] = useState(false);

  	const theme = useMantineTheme();

	const initialValues = props?.line ? {
        valid: (props.line as ILigneDeFrais)?.etat ? (props.line as ILigneDeFrais).etat : LIGNEDEFRAIS_ETAT.VALIDEE,
		comment: (props.line as ILigneDeFrais)?.commentaire_validateur ?? "",
	} : {
        valid: LIGNEDEFRAIS_ETAT.VALIDEE,
		comment: "",
	}

	const form = useForm({
		initialValues,
		validationRules: {},
		errorMessages: {},
	});

	const handleSubmit = async (values: typeof form['values']) => {
		setLoading(true);
		console.log(values);
		props.setOpened(false);
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<LoadingOverlay visible={loading} />
			<RadioGroup
				{...form.getInputProps('valid')}
				required
			>
				<Radio value={LIGNEDEFRAIS_ETAT.VALIDEE}>Validée</Radio>
				<Radio value={LIGNEDEFRAIS_ETAT.REFUSEE}>Refusée</Radio>
			</RadioGroup>

            {line && <Space h="md" />}
            {line && (line as ILigneDeFrais)?.commentaire?.length === 0 && <Title order={6}>Commentaire</Title>}
            {line && renderComment(line, theme, {width: "100%"})}

			<Space h="md" />

			<Textarea
				placeholder={"Si besoin, détaillez votre choix."}
				label={"Commentaire validateur"}
				{...form.getInputProps('comment')}
			/>
			<Space h="md" />

			<Group position="center">
				<Button type="submit" color="green">
					{"Sauvegarder"}
				</Button>
			</Group>
		</form>
	);
}
