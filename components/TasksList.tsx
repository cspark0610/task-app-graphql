import Link from 'next/Link';
import React from 'react';
import { Task } from '../generated/graphql-frontend';
import TasksListItem from './TasksListItem';

interface Props {
	tasks: Task[];
}

const TasksList: React.FC<Props> = ({ tasks }) => {
	return (
		<ul className="task-list">
			{tasks &&
				tasks.length > 0 &&
				tasks.map((task) => {
					return <TasksListItem key={task.id} task={task} />;
				})}
		</ul>
	);
};

export default TasksList;
