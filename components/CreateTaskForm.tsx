import React, { useState } from 'react';
import { useCreateTaskMutation } from '../generated/graphql-frontend';

interface Props {
	onSuccess: () => void;
}
const CreateTaskForm: React.FC<Props> = ({ onSuccess }) => {
	const [title, setTitle] = useState('');
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};
	const [createTask, { loading, error }] = useCreateTaskMutation({
		onCompleted: () => {
			onSuccess();
			setTitle('');
		},
	});
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!loading) {
			try {
				await createTask({
					variables: {
						input: { title },
					},
				});
			} catch (error) {
				console.log(error);
			}
		}
	};
	return (
		<form onSubmit={handleSubmit}>
			{error && <p className="alert-error">An error occurred</p>}
			<input
				type="text"
				name="title"
				placeholder="create a task you want to do"
				autoComplete="off"
				className="text-input new-task-text-input"
				value={title}
				onChange={handleTitleChange}
			/>
		</form>
	);
};

export default CreateTaskForm;
