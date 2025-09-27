export default async function RootPage() {
	// const experiences = await eden.experience.get({$query: {}});

	return (
		<div className="container mx-auto max-w-7xl px-4 py-2">
			<h1>Root</h1>
			{/* <pre>Experience: {JSON.stringify(experiences, null, 2)}</pre> */}
		</div>
	);
}
