import { TextInput, Checkbox, Button, Group, Space, RadioGroup, Radio, Select, Textarea, Text, NumberInput, useMantineTheme, MantineTheme, LoadingOverlay, Loader } from '@mantine/core';
import { HiCalendar, HiUpload, HiOutlineXCircle, HiPhotograph } from "react-icons/hi";
import { Dropzone, MIME_TYPES, DropzoneStatus } from '@mantine/dropzone';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import { LIGNE_TYPE } from '../entity/utils'
import { ILigneDeFrais } from '../entity/lignedefrais.entity'
import { INoteDeFrais } from '../entity/notedefrais.entity'
import { CSSProperties, Dispatch, SetStateAction, useState } from 'react'
import dayjs from 'dayjs'
import { EmptyNote, UILigne } from '../pages/home/[params]';
import { Routes } from '../utils/api';
import { useNotifications } from '@mantine/notifications';
import { NotificationsContextProps } from '@mantine/notifications/lib/types';
import { IMission } from '../entity/mission.entity';

function ImageUploadIcon({ status, ...props }: {status: DropzoneStatus, style: CSSProperties}) {
	if (status.accepted) {
    	return <HiUpload {...props} />;
  	}

	if (status.rejected) {
    	return <HiOutlineXCircle {...props} />;
  	}

	return <HiPhotograph {...props} />;
}

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  	return status.accepted
		? theme.colors[theme.primaryColor][6]
		: status.rejected
		? theme.colors.red[6]
		: theme.colorScheme === 'dark'
		? theme.colors.dark[0]
		: theme.black;
}

async function fillMissionData(date: Date | null, 
	setMissionSelectState: Dispatch<SetStateAction<MissionSelectState>>,
	notifications: NotificationsContextProps
) {
	if (!date) {
		setMissionSelectState({
			loading: false,
			data: [],
			missions: []
		});
		return;
	}

	setMissionSelectState({
		loading: true,
		data: [], 
		missions: []
	});

	const request = await Routes.MISSION.get(date.getTime()) as IMission[] | null;
	if (!request) {
		notifications.showNotification({
			title: 'Erreur !',
			color: "red",
			message: `Nous venons de rencontrer un problème 😔`,
		});
		return;
	}

	setMissionSelectState({
		loading: false,
		data: request.map(r => {
			return { 
				value: r.id, 
				label: r.titre
			}
		}),
		missions: request
	});
}

type LineFormProps = {
  	line: UILigne | null,
  	setOpened: React.Dispatch<React.SetStateAction<boolean>>,
  	linesToSave: UILigne[],
  	setLineToSave: React.Dispatch<React.SetStateAction<UILigne[]>>,
  	note: INoteDeFrais | EmptyNote,
}

type MissionSelectState = {
	loading: boolean,
	data: any[],
	missions: IMission[]
}

type DropzoneState = {
	error: boolean,
	files: File[]
}

export type TempLigneDeFrais = Omit<ILigneDeFrais, "commentaire_validateur" | "etat"> & {files: File[]};

function renderFile(props: LineFormProps, 
	form: any,
	lost: boolean, 
	dropzone: DropzoneState,
	setDropzone: Dispatch<SetStateAction<DropzoneState>>,
	notifications: NotificationsContextProps, 
	theme: MantineTheme
) {
	if (lost) return <></>;

	return <Dropzone
		multiple={false}
		onDrop={(files) => {
			setDropzone({
				files: files,
				error: false
			})
		}}
		onReject={(files) => {
			const plural = files.length > 1;
			const s = plural ? "s" : "";
			const msg = `Le${s} fichier${s} : ${files.map(f => f.file.name).join(", ")} n'${plural ? "ont" : "a"} pas un format de fichier valide.`
			notifications.showNotification({
				title: 'Erreur !',
				color: "red",
				message: `${msg} 😔`,
			});
			setDropzone({
				...dropzone,
				error: dropzone.files.length === 0
			})
		}}
		maxSize={3 * 1024 ** 2}
		accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
		{...form.getInputProps('justification')}
		sx={(theme) => ({
			backgroundColor: "#2c2e33",
			borderColor: dropzone.error ? theme.colors.red[6] : "",
		})}
	>
		{(status) => {
			const fileName = dropzone.files?.[0]?.name ?? props.line?.justificatif ?? "";

			var content = <>
				<ImageUploadIcon
					status={status}
					style={{ 
						width: 50, 
						height: 50, 
						color: dropzone.error ? theme.colors.red[6] : getIconColor(status, theme) 
					}}
				/>
				<div>
					<Text size="lg" inline sx={(theme) => ({
						color: dropzone.error ? theme.colors.red[6] : "",
					})}>
						Justificatif
					</Text>
					<Text size="xs" color="dimmed" inline mt={7} sx={(theme) => ({
						color: dropzone.error ? theme.colors.red[6] : "",
					})}>
						{"Faites glisser l'image ici ou cliquez pour sélectionner le fichier"}
					</Text>
				</div>
			</>

			if (fileName !== "") {
				content = <>
					<Text>{fileName}</Text>
				</>
			}

			return <Group position="center" spacing="sm" style={{ pointerEvents: 'none' }}>
				{content}
			</Group>
		}}
	</Dropzone>
}

export default function EditLineForm(props: LineFormProps) {
	const notifications = useNotifications();
  	const [loading, setLoading] = useState(false);
	const [missionSelectState, setMissionSelectState] = useState(({
		loading: false,
		data: props.line?.mission?.id ? [{value: props.line.mission.id, label: props.line.mission.titre}] : [],
		missions: props.line?.mission?.id ? [props.line.mission] : []
	}) as MissionSelectState);
	const [dropzone, setDropzone] = useState(({
		error: false,
		files: (props?.line as TempLigneDeFrais)?.files ?? []
	}) as DropzoneState)

  	const theme = useMantineTheme();

	const form = useForm({
		initialValues: props?.line ? {
			repaymentMode: props.line.avance ? "advance" : "expense",
			lineTitle: props.line.titre,
			date: dayjs(props.line.date).toDate(),
			expenseType: props.line.type,
			mission: props.line.mission.id,
			ttc:  props.line.prixTTC,
			ht: props.line.prixHT,
			tva: props.line.prixTVA,
			lost: props.line.perdu,
			justification: props.line.justificatif, // TODO
			comment: props.line.commentaire,
		} : {
			repaymentMode: "expense",
			lineTitle: "",
			date: null,
			expenseType: "",
			mission: "",
			ttc: 0.000,
			ht: 0.000,
			tva: 0.000,
			lost: false,
			justification: "", // TODO
			comment: "",
		},

		validationRules: {
			lineTitle: (value) => value.trim().length >= 5,
			date: (value) => value !== null,
			expenseType: (value) => Object.values(LIGNE_TYPE).includes(value as LIGNE_TYPE),
			mission: (value) => value !== '',
			ttc: 	(value) => {
				const ht = form.values.ht as number;
				const tva = form.values.tva as number;

				return value > 0 && value === ht + tva;
			},
			ht: 	(value) => value > 0.0,
			tva: 	(value) => value > 0.0,	
			lost: 	(value) => {
				if (value) {
					return value;  
				}

				const res = (!(props?.line as TempLigneDeFrais)?.files && dropzone.files.length === 0) || dropzone.files.length > 0;

				setDropzone({
					...dropzone,
					error: !res
				})

				return res;
			}
		},

		errorMessages: {
			lineTitle: 'Le titre doit comporter 5 caractères ou plus',
			date: 'Une date doit être spécifiée',
			expenseType: 'Ce champ est obligatoire',
			lost: "Vous devez joindre au moins un justificatif"
		},
	});

	const handleSubmit = async (values: typeof form['values']) => {
		setLoading(true);
		console.log(values);

		var tempLine: TempLigneDeFrais = {
			avance: (values.repaymentMode === "advance" ? true : false),
			titre: values.lineTitle,
			date: dayjs(values.date).toDate(),
			type: values.expenseType as LIGNE_TYPE,
			mission: missionSelectState.missions.find(m => m.id === values.mission) as IMission,
			prixTTC: values.ttc,
			prixHT: values.ht,
			prixTVA: values.tva,
			perdu: values.lost,
			justificatif: dropzone.files?.[0]?.name ?? props?.line?.justificatif ?? "",
			commentaire: values.comment,
			files: dropzone.files,
			id: props?.line?.id ? props.line.id : `temp-${props.linesToSave.length}`
		}

		// Line Exist
		if (props?.line) {
			// Line was created and is edited
			if (props.line.id.includes("temp-")) {
				const newLinesToSave = props.linesToSave.map(l => {
					if (l.id === props?.line?.id) {
						const temp: UILigne =  {
							...tempLine,
							UI: "post" // Keeps "post" action since the line is not stored in DB
						}
						return temp;
					}
					return l;
				}) 
				props.setLineToSave(newLinesToSave);
			} else { // Line is stored in database an is edited
				const filtered = props.linesToSave.filter(l => l.id !== props?.line?.id);
				props.setLineToSave([...filtered, {...tempLine, UI: "put"}]);
			}
		} else { // Line does not exists
			props.setLineToSave([...props.linesToSave, {...tempLine, UI: "post"}]);
		}
		props.setOpened(false);
	};

  	const missionSelectIcon = missionSelectState.loading ? {icon: <Loader size="sm"></Loader>} : {};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<LoadingOverlay visible={loading} />
			<RadioGroup
				{...form.getInputProps('repaymentMode')}
				// description="This is anonymous"
				required
			>
				<Radio value="expense">Frais déjà déboursé</Radio>
				<Radio value="advance">{"Demande d'avance"}</Radio>
			</RadioGroup>

			<Space h="md" />

			<TextInput
				data-autofocus
				label="Titre de la ligne"
				placeholder="Donnez un titre à cette ligne de frais"
				onBlur={() => form.validateField('lineTitle')}
				{...form.getInputProps('lineTitle')}
				required
			/>

			<Group direction="row">
				<DatePicker placeholder="Sélectionnez la date" label="Date du frais" required
					icon={<HiCalendar size={16}/>}
					// minDate={dayjs(new Date()).startOf('month').add(5, 'days').toDate()}
					// maxDate={dayjs(new Date()).endOf('month').subtract(5, 'days').toDate()}
					{...form.getInputProps('date')}
					onChange={(date: Date | null) => {
						form.setFieldValue('date', date);
						form.setFieldValue("mission", "")
						fillMissionData(date, setMissionSelectState, notifications);
					}}
					onBlur={() => form.validateField('date')}
				/>
				<Select
					label="Type de frais"
					placeholder="Sélectionnez le type de frais"
					data={Object.values(LIGNE_TYPE)}
					{...form.getInputProps('expenseType')}
					required
				/>
			</Group>

			<Space h="md" />

			<Select
			 	{...missionSelectIcon}
				disabled={missionSelectState.loading || missionSelectState.data.length === 0}
				label="Mission associée"
				placeholder="Sélectionnez la mission associée"
				data={missionSelectState.data}
				{...form.getInputProps('mission')}
				required
			/>

			<Space h="md" />

			<Group direction="row">
				<NumberInput label="Montant HT" size="xs"
					{...form.getInputProps('ht')}
					precision={2} step={0.01}
					required min={0} // max={10000}
					onChange={(value) => {
						form.setFieldValue('ht', value ?? 0);
						form.setFieldValue("ttc", (value ?? 0) + form.values.tva);
						["ttc", "ht", "tva"].forEach(field => form.validateField(field as any));
					}}
				/>
				<NumberInput label="Montant TVA" size="xs"
					{...form.getInputProps('tva')}
					precision={2} step={0.01}
					required min={0} // max={10000}
					onChange={(value) => {
						form.setFieldValue('tva', value ?? 0);
						form.setFieldValue("ttc", (value ?? 0) + form.values.ht);
						["ttc", "ht", "tva"].forEach(field => form.validateField(field as any));
					}}
				/>
				<NumberInput label="Montant TTC" size="xs"
					{...form.getInputProps('ttc')}
					precision={2} step={0.01}
					required min={0} // max={10000}
					disabled={true}
					onChange={(value) => {
						form.setFieldValue('ttc', value ?? 0);
						["ttc", "ht", "tva"].forEach(field => form.validateField(field as any));
					}}
				/>
			</Group>

			<Space h="md" />

			{renderFile(props, form, form.getInputProps("lost").value, dropzone, setDropzone, notifications, theme)}

			{!form.getInputProps("lost").value && dropzone.error ? 
				<Text size="sm" sx={(theme) => ({
					paddingTop: "0.25rem",
					color: dropzone.error ? theme.colors.red[6] : "",
				})}>{form.getInputProps("lost").error}</Text> : <></>}

			<Checkbox label="J'ai perdu mon justificatif" mt="md"
				{...form.getInputProps('lost', { type: 'checkbox' })}
			/>
			<Space h="md" />

			<Textarea
				placeholder="Si besoin, ajouter des détails à destination du validateur"
				label="Commentaire"
				{...form.getInputProps('comment')}
			/>
			<Space h="md" />

			<Group position="center">
				<Button type="submit" color="green">
					{props?.line // TODO: disabled if no changes
						? "Enregistrer les modifications"
						: "Ajouter la ligne de frais"
					}
				</Button>
			</Group>
		</form>
	);
}
