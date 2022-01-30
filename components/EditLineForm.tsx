import { TextInput, Checkbox, Button, Group, Space, RadioGroup, Radio, Select, Textarea, Text, NumberInput, useMantineTheme } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import { HiCalendar, HiUpload, HiOutlineXCircle, HiPhotograph } from "react-icons/hi";
import { LIGNE_TYPE } from '../entity/utils'

function ImageUploadIcon({ status, ...props }) {
  if (status.accepted) {
    return <HiUpload {...props} />;
  }

  if (status.rejected) {
    return <HiOutlineXCircle {...props} />;
  }

  return <HiPhotograph {...props} />;
}

function getIconColor(status, theme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][6]
    : status.rejected
    ? theme.colors.red[6]
    : theme.colorScheme === 'dark'
    ? theme.colors.dark[0]
    : theme.black;
}


export default function EditLineForm() {
  	const theme = useMantineTheme();

	const form = useForm({
		initialValues: {
			repaymentMode: "expense",
			lineTitle: '',
			date: '',
			expenseType: '',
			mission: '',
			ttc: 0.000,
			ht: 0.000,
			tva: 0.000,
			lost: false,
			justification: '',
			comment: '',
		},

		validationRules: {
			lineTitle: (value) => value.trim().length >= 5,
			date: (value) => value !== '',
			expenseType: (value) => Object.values(LIGNE_TYPE).includes(value),
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

	return (
		<form onSubmit={form.onSubmit((values) => console.log(values))}>
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

			<Checkbox
				mt="md"
				label="J'ai perdu mon justificatif"
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
				<Button type="submit" color="green">Enregistrer les modifications</Button>
			</Group>
		</form>
	);
}
