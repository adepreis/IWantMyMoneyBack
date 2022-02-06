import { TextInput, Checkbox, Button, Group, Space, RadioGroup, Radio, Select, Textarea, Text, NumberInput, useMantineTheme, MantineTheme, LoadingOverlay } from '@mantine/core';
import { HiCalendar, HiUpload, HiOutlineXCircle, HiPhotograph } from "react-icons/hi";
import { Dropzone, MIME_TYPES, DropzoneStatus } from '@mantine/dropzone';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import { LIGNE_TYPE } from '../entity/utils'
import { ILigneDeFrais } from '../entity/lignedefrais.entity'
import { INoteDeFrais } from '../entity/notedefrais.entity'
import { useState } from 'react'
import dayjs from 'dayjs'

function ImageUploadIcon({ status, ...props }) {
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


type LineFormProps = {
  line: ILigneDeFrais | null,
  setOpened: React.Dispatch<React.SetStateAction<any>>,
  linesToSave: {
	  line: ILigneDeFrais,
	  action: 'delete' | 'post' | 'put',
	}[],
  setLineToSave: React.Dispatch<React.SetStateAction<any>>,
  note: INoteDeFrais,
  setNote: React.Dispatch<React.SetStateAction<any>>
}

export default function EditLineForm(props: LineFormProps) {
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();

  const lineAlreadyExists = props.line !== null; 	// not needed if line is null

	const form = useForm({
		initialValues: {
			repaymentMode:  lineAlreadyExists ? (props.line.avance ? "advance" : "expense") : "expense",
			lineTitle: 			lineAlreadyExists ? props.line.titre : '',
			date: 					lineAlreadyExists ? dayjs(props.line.date).toDate() : null,
			expenseType:		lineAlreadyExists ? props.line.type : '',
			mission: 				lineAlreadyExists ? props.line.mission.titre : '',
			ttc: 	lineAlreadyExists ? props.line.prixTTC : 0.000,
			ht: 	lineAlreadyExists ? props.line.prixHT 	: 0.000,
			tva: 	lineAlreadyExists ? props.line.prixTVA : 0.000,
			lost: lineAlreadyExists ? props.line.perdu 	: false,
			justification: '',		// TODO
			comment: lineAlreadyExists ? props.line.commentaire : '',
		},

		validationRules: {
			lineTitle: (value) => value.trim().length >= 5,
			date: (value) => value !== null,
			expenseType: (value) => Object.values(LIGNE_TYPE).includes(value as LIGNE_TYPE),
			mission: (value) => value !== '',
			ttc: 	(value) => value > 0.0,	// TODO: assert tax computing
			ht: 	(value) => value > 0.0,	// TODO: assert tax computing
			tva: 	(value) => value > 0.0,	// TODO: assert tax computing
		},

		errorMessages: {
			lineTitle: 'Le titre doit comporter 5 caractères ou plus',
		  date: 'Une date doit être spécifiée',
		  expenseType: 'Ce champ est obligatoire',
		},
	});

	const handleSubmit = async (values: typeof form['values']) => {
    setLoading(true);
    console.log(values);

    var tempLine: ILigneDeFrais = {
    	avance:	(values.repaymentMode ===  "advance" ? true : false),
			titre:	values.lineTitle,
			date:	dayjs(values.date).toDate(),
			type:	LIGNE_TYPE[values.expenseType as keyof typeof LIGNE_TYPE],
			// mission:	values.mission,	// ?
			// id:	values.id,	// ?
			// validee:	values.validee,	// ?
			// commentaire_validateur:	values.commentaire_validateur,	// ?
			prixTTC:	values.ttc,
			prixHT :	values.ht,
			prixTVA:	values.tva,
			perdu:	values.lost,
			justificatif:	values.justification,
			commentaire:	values.comment
    }
		
  	props.setLineToSave([...props.linesToSave, {line: tempLine, action: (lineAlreadyExists ? 'put' : 'post')}]);

  	var updatedLines: ILigneDeFrais[] = props.note.lignes.map((l) => {
      return l.id === tempLine.id ? tempLine : l
    });
    props.note.lignes = updatedLines;
    props.setNote(props.note);

    props.setOpened(false);
  };

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<LoadingOverlay visible={loading} />
			<RadioGroup
				{...form.getInputProps('repaymentMode')}
				// description="This is anonymous"
				required
			>
				<Radio value="expense">Frais déjà déboursé</Radio>
				<Radio value="advance">Demande d'avance</Radio>
			</RadioGroup>

			<Space h="md" />

			<TextInput
				data-autofocus
				label="Titre de la ligne"
				placeholder="Donnez un titre à cette ligne de frais"
				{...form.getInputProps('lineTitle')}
				required
			/>

			<Group direction="row">
				<DatePicker placeholder="Sélectionnez la date" label="Date du frais" required
					icon={<HiCalendar size={16}/>}
					// minDate={dayjs(new Date()).startOf('month').add(5, 'days').toDate()}
					// maxDate={dayjs(new Date()).endOf('month').subtract(5, 'days').toDate()}
					{...form.getInputProps('date')}
					// onChange={(event) => fillMissionData }
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

			{/* TODO: retrieve mission 		GET /api/mission/[timestamp] */}
			<Select
				label="Mission associée"
				placeholder="Sélectionnez la mission associée"
				data={[
					{ value: 'Schaden, Hintz and Konopelski', label: 'Rick', group: 'Used to be a pickle' },
					{ value: 'morty', label: 'Morty', group: 'Never was a pickle' },
					{ value: 'beth', label: 'Beth', group: 'Never was a pickle' },
					// { value: 'Autre', label: 'Autre' },	// no group generates "unique key" error
				]}
				{...form.getInputProps('mission')}
				required
			/>

			<Space h="md" />

			<Group direction="row">
				<NumberInput label="Montant TTC" size="xs"
					{...form.getInputProps('ttc')}
					precision={3} step={0.001}
					required min={0} // max={10000}
				/>
				<NumberInput label="Montant HT" size="xs"
					{...form.getInputProps('ht')}
					precision={3} step={0.001}
					required min={0} // max={10000}
				/>
				<NumberInput label="Montant TVA" size="xs"
					{...form.getInputProps('tva')}
					precision={3} step={0.001}
					required min={0} // max={10000}
				/>
			</Group>

			<Space h="md" />

			<Dropzone
		      	onDrop={(files) => console.log('accepted files', files)}
		      	onReject={(files) => console.log('rejected files', files)}
		      	maxSize={3 * 1024 ** 2}
		      	accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg, MIME_TYPES.pdf]}
						{...form.getInputProps('justification')}
		    >
		      {(status) => (
		        <Group position="center" spacing="sm" style={{ pointerEvents: 'none' }}>
		          <ImageUploadIcon
		            status={status}
		            style={{ width: 50, height: 50, color: getIconColor(status, theme) }}
		          />

		          <div>
		            <Text size="lg" inline>
		             	Justificatif
		            </Text>
		            <Text size="xs" color="dimmed" inline mt={7}>
		            	Faites glisser l'image ici ou cliquez pour sélectionner le fichier
		            </Text>
		          </div>
		        </Group>
		      )}
		    </Dropzone>

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
					{lineAlreadyExists // TODO: disabled if no changes
						? "Enregistrer les modifications"
						: "Ajouter la ligne de frais"
					}
				</Button>
			</Group>
		</form>
	);
}
