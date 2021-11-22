// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//https://github.com/vercel/next.js/blob/canary/examples/api-routes-graphql/pages/api/graphql.js

import { ApolloServer, gql } from 'apollo-server-micro';
import { IResolvers } from '@graphql-tools/utils';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import mysql from 'serverless-mysql';

const typeDefs = gql`
	enum TaskStatus {
		active
		completed
	}
	type Task {
		id: Int!
		title: String!
		status: TaskStatus!
	}
	type Query {
		tasks(status: TaskStatus): [Task!]!
		task(id: Int!): Task!
	}

	input CreateTaskInput {
		title: String!
	}

	input UpdateTaskInput {
		id: Int!
		title: String
		status: TaskStatus
	}

	type Mutation {
		createTask(input: CreateTaskInput): Task
		updateTask(input: UpdateTaskInput): Task
		deleteTask(id: Int!): Task
	}
`;

const resolvers: IResolvers<any, ApolloContext> = {
	Query: {
		async tasks(parent, args, context) {
			const result = await context.db.query('SELECT * FROM tasks');
			await db.end();
			console.log(result);
			return result;
		},
		task(parent, args, context) {
			return null;
		},
	},
	Mutation: {
		createTask(parent, args, context) {
			return null;
		},
		updateTask(parent, args, context) {
			return null;
		},
		deleteTask(parent, args, context) {
			return null;
		},
	},
};

const db = mysql({
	config: {
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		database: process.env.MYSQL_DATABASE,
		password: process.env.MYSQL_PASSWORD,
	},
});

interface ApolloContext {
	db: mysql.ServerlessMysql;
}
//setup apollo server' s resolver function
const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	context: { db },
	//displays old playground web app
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

//we need to strat apollo server' s before creating the handler function
const serverStartPromise = apolloServer.start();
let graphqlHandler: NextApiHandler | undefined;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!graphqlHandler) {
		await serverStartPromise;
		graphqlHandler = apolloServer.createHandler({ path: '/api/graphql' });
	}
	return graphqlHandler(req, res);
};

export default handler;
