import { GetServerSideProps } from 'next';
import React from 'react';
import { initializeApollo } from '../../lib/client';
import { TaskQuery, TaskQueryVariables, TaskDocument, useTaskQuery } from '../../generated/graphql-frontend';
import { useRouter } from 'next/router';
import Error from 'next/error';
import UpdateTaskForm from '../../components/UpdateTaskForm';

const UpdateTask = () => {
	//to get the id from the url in a page component have to use next useRouter hook
	const router = useRouter();

	const id = typeof router.query.id === 'string' ? parseInt(router.query.id, 10) : NaN;
	if (!id) {
		return <Error statusCode={404} />;
	}
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { data, loading, error } = useTaskQuery({
		variables: { id },
	});
	const task = data?.task;

	return loading ? (
		<p>loading...</p>
	) : error ? (
		<p>An error ocurred.</p>
	) : task ? (
		<div>
			<UpdateTaskForm initialValues={{ title: task.title }} id={task.id} />
		</div>
	) : (
		<p>No task found for id {id}</p>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const id = typeof context.params?.id === 'string' ? parseInt(context.params.id, 10) : NaN;
	if (id) {
		const apolloClient = initializeApollo();
		await apolloClient.query<TaskQuery, TaskQueryVariables>({
			query: TaskDocument,
			variables: { id },
		});
		return {
			props: {
				initialApolloState: apolloClient.cache.extract(),
			},
		};
	}
	return {
		props: {},
	};
};

export default UpdateTask;
