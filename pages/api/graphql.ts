// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//https://github.com/vercel/next.js/blob/canary/examples/api-routes-graphql/pages/api/graphql.js

import { ApolloServer } from 'apollo-server-micro';
import { db } from '../../backend/db';
import { schema } from '../../backend/schema';
import { resolvers } from '../../backend/resolvers';
import { typeDefs } from '../../backend/type-defs';

//heres start server config
//setup apollo server' s resolver function
const apolloServer = new ApolloServer({ schema, context: { db } });

export const config = {
	api: {
		bodyParser: false,
	},
};

export default apolloServer.createHandler({ path: '/api/graphql' });
