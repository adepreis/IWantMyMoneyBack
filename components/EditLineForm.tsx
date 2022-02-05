import { TextInput, Checkbox, Button, Group, Space, RadioGroup, Radio, Select, Textarea, Text, NumberInput, useMantineTheme, MantineTheme, LoadingOverlay } from '@mantine/core';
import { HiCalendar, HiUpload, HiOutlineXCircle, HiPhotograph } from "react-icons/hi";
import { Dropzone, MIME_TYPES, DropzoneStatus } from '@mantine/dropzone';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import { LIGNE_TYPE } from '../entity/utils'
import { ILigneDeFrais } from '../entity/lignedefrais.entity'
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
  // formType: "edit" | "add" 	// not needed if line is null
}

export default function EditLineForm(props: LineFormProps) {
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();

	const form = useForm({
		initialValues: {
			repaymentMode:  props.line ? (props.line.avance ? "advance" : "expense") : "expense",
			lineTitle: 			props.line ? props.line.titre : '',
			date: 					props.line ? dayjs(props.line.date).toDate() : null,
			expenseType:		props.line ? props.line.type : '',
			mission: 				props.line ? props.line.mission : '',
			ttc: 	props.line ? props.line.prixTTC : 0.000,
			ht: 	props.line ? props.line.prixHT 	: 0.000,
			tva: 	props.line ? props.line.prixTVA : 0.000,
			lost: props.line ? props.line.perdu 	: false,
			justification: '',		// TODO
			comment: props.line ? props.line.commentaire : '',
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

    setTimeout(() => {
      setLoading(false);
    }, 1500);
		
		{/*TODO : send PUT or POST query with smtg like :


			enctype="multipart/form-data" see https://stackoverflow.com/a/35206069
			
			const requestOptions = {
			    method: 'PUT',		// or PUT
			    headers: { 'Content-Type': 'application/json' },
			    body: JSON.stringify({ id: '{props.ligne.id}', title: 'React PUT Request Example' })
			};
			const request = await fetch(`/api/ligne`, requestOptions)
			    .then(response => response.json())
			    .then(data => this.setState({ postId: data.id }));
      

      if (request.status === 200) {
        const result = await request.json();
        return result;
      } 
      // Error while fetching
      else {
        return null;
      }
		*/}

    props.setOpened(false);form
  };

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<LoadingOverlay visible={loading} />
			<RadioGroup
				{...form.getInputProps('repaymentMode')} // onChange={setValue}
				// label="Select your favorite framework/library"
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
				/>
				<Select
					label="Type de frais"
					placeholder="Sélectionnez le type de frais"
					// data={[
					// 	{ value: 'rick', label: 'Rick', group: 'Used to be a pickle' },
					// 	{ value: 'morty', label: 'Morty', group: 'Never was a pickle' },
					// ]}
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
					{ value: 'rick', label: 'Rick', group: 'Used to be a pickle' },
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
					{props.line
						? "Enregistrer les modifications"
						: "Ajouter la ligne de frais"
					}
				</Button>
			</Group>
		</form>
	);
}
