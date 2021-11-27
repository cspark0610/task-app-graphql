import React from 'react';
import Link from 'next/Link';
const Layout: React.FC = ({ children }) => {
	return (
		<div className="page">
			<Link href="">
				<a>
					{' '}
					<img src="/logo.png" alt="logo" />
				</a>
			</Link>
			{children}
		</div>
	);
};

export default Layout;
