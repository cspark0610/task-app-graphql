import { Reference } from '@apollo/client';
import Link from 'next/Link';
import React, { useEffect } from 'react';
import { Task, useDeleteTaskMutation, TaskStatus, useUpdateTaskMutation } from '../generated/graphql-frontend';

interface Props {
	task: Task;
}
const TasksListItem: React.FC<Props> = ({ task }) => {
	const [deleteTask, { loading, error }] = useDeleteTaskMutation({
		variables: { id: task.id },
		errorPolicy: 'all',
		update: (cache, result) => {
			const deletedTask = result.data?.deleteTask;
			if (deletedTask) {
				//console.log(cache.extract());
				cache.modify({
					fields: {
						tasks(tasksRefs: Reference[], { readField }) {
							//console.log(tasksRefs);
							return tasksRefs.filter((taskRef) => {
								const task = readField('id', taskRef);
								return task !== deletedTask.id;
							});
						},
					},
				});
			}
		},
	});
	const handleDeleteClick = async (): Promise<void> => {
		//cuando el user hace click dentro de esta funcion debo correr la mutation de useDeleteTask
		// para evitar el 'unhlandled runtime error' la ejecucion de la mutation function se debe hacer dentro de un try/catch block
		try {
			await deleteTask();
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (error) {
			alert('some error has occurred');
		}
	}, [error]);
	//HAVE TO RENAME LOADING AN ERROR VARIABLE TO SOMETHING ELSE
	const [updateTask, { loading: updateTaskLoading, error: updateTaskError }] = useUpdateTaskMutation({
		errorPolicy: 'all',
	});
	const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newStatus = e.target.checked ? TaskStatus.Completed : TaskStatus.Active;
		updateTask({
			variables: {
				input: { id: task.id, status: newStatus },
			},
		});
	};
	useEffect(() => {
		if (updateTaskError) {
			alert('some error has occurred, please try again');
		}
	}, [updateTaskError]);
	return (
		<>
			<li key={task.id} className="task-list-item">
				<label className="checkbox">
					<input
						type="checkbox"
						onChange={handleChangeStatus}
						checked={task.status === TaskStatus.Completed}
						disabled={updateTaskLoading}
					/>
				</label>
				<Link href="/update/[id]" as={`/update/${task.id}`}>
					<a className="task-list-item-title">{task.title}</a>
				</Link>
			</li>
			<button className="task-list-item-title" disabled={loading} onClick={handleDeleteClick}>
				&times;
			</button>
		</>
	);
};
//voy a agregar aca el button para el delete

export default TasksListItem;
