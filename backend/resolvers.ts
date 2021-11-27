import { ServerlessMysql } from 'serverless-mysql';
import { Resolvers, TaskStatus } from '../generated/graphql-backend';
import { OkPacket } from 'mysql';
import { UserInputError } from 'apollo-server-errors';

interface ApolloContext {
	mysql: ServerlessMysql;
	db: ServerlessMysql;
}
interface TaskDbRow {
	id: number;
	title: string;
	task_status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];
type TaskDbQueryResult = TaskDbRow[];

const getTaskById = async (id: number, db: ServerlessMysql) => {
	const task = await db.query<TaskDbQueryResult>('SELECT id, title, task_status FROM tasks WHERE id = ?', [id]);
	await db.end();
	return task.length
		? {
				id: task[0].id,
				title: task[0].title,
				status: task[0].task_status,
		  }
		: null;
};

export const resolvers: Resolvers<ApolloContext> = {
	Query: {
		async tasks(parent, args, context) {
			const { status } = args;
			let query = 'SELECT id, title, task_status FROM tasks';
			const queryParams: string[] = [];
			if (status) {
				//dado que el status es opcional
				query += 'WHERE task_status = ?';
				queryParams.push(status);
			}
			const tasks = await context.db.query<TasksDbQueryResult>(query, queryParams);
			await context.db.end();

			return tasks.map(({ id, title, task_status }) => ({
				id,
				title,
				status: task_status as TaskStatus,
			}));
		},
		async task(parent, args, context) {
			return await getTaskById(args.id, context.db);
		},
	},
	Mutation: {
		async createTask(parent, args, context) {
			const { title } = args.input;
			const result = await context.db.query<OkPacket>('INSERT INTO tasks (title, task_status) VALUES(?,?)', [
				title,
				TaskStatus.Active,
			]);
			return {
				id: result.insertId,
				title,
				status: TaskStatus.Active,
			};
		},
		async updateTask(parent, args, context) {
			const queryBase = 'UPDATE tasks SET';
			const columns: string[] = [];
			const sqlParams: any[] = [];

			if (args.input.title) {
				columns.push('title = ?');
				sqlParams.push(args.input.title);
			}

			if (args.input.status) {
				columns.push('task_status = ?');
				sqlParams.push(args.input.status);
			}
			//id es obligatorio siempre pasarlo
			sqlParams.push(args.input.id);
			await context.db.query(`${queryBase} ${columns.join(',')} WHERE id = ?`, sqlParams);
			const updatedTask = await getTaskById(args.input.id, context.db);
			return updatedTask;
		},
		async deleteTask(parent, args, context) {
			const task = await getTaskById(args.id, context.db);
			if (!task) {
				throw new UserInputError('Task not found');
			}
			await context.db.query('DELETE FROM tasks WHERE id = ?', [args.id]);

			return task;
		},
	},
};
