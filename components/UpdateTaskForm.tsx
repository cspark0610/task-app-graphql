import { isApolloError } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useUpdateTaskMutation } from '../generated/graphql-frontend';
import UpdateTask from '../pages/update/[id]';

interface Values {
	title: string;
}
interface Props {
	initialValues: Values;
	id: number;
}
const UpdateTaskForm: React.FC<Props> = ({ initialValues }, id) => {
	const [values, setValues] = useState<Values>(initialValues);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		//para hacer el input value controlado
		const { name, value } = e.target;
		setValues((prevValues) => ({ ...prevValues, [name]: value }));
	};
	const router = useRouter();
	const [updateTask, { loading, error }] = useUpdateTaskMutation();
	const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		try {
			const result = await updateTask({ variables: { input: { id, title: values.title } } });
			if (result.data?.UpdateTask) {
				router.push('/');
				//redireccionamos a la home page
			}
		} catch (error) {
			console.log(error);
		}
	};
	let errorMessage = '';
	if (error) {
		if (error.networkError) {
			errorMessage = 'A network error occurred';
		} else {
			errorMessage = 'Sorry an error occurred';
		}
	}
	return (
		<form onSubmit={handlerSubmit}>
			{error && <p className="alert-error">{errorMessage}</p>}
			<p>
				<label className="field-label">Title</label>
				<input type="text" name="title" className="text-input" value={values.title} onChange={handleChange} />
			</p>
			<p>
				<button type="submit" className="button" disabled={loading}>
					{loading ? 'loading...' : 'Save changes'}
				</button>
			</p>
		</form>
	);
};

export default UpdateTaskForm;
