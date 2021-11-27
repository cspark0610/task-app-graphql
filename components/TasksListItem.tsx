import { Reference } from '@apollo/client';
import Link from 'next/Link';
import React, { useEffect } from 'react';
import { Task, useDeleteTaskMutation, TasksDocument } from '../generated/graphql-frontend';

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
	return (
		<>
			<li key={task.id} className="task-list-item">
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
