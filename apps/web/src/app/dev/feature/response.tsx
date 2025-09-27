export default function Response({
	response,
	title = "Response",
}: {
	response: unknown;
	title?: string;
}) {
	return (
		<div className="container mx-auto border-2 border-red-500">
			<h1 className="font-bold text-2xl text-white">{title}</h1>
			<pre className="mt-5 whitespace-pre-wrap text-white">
				{JSON.stringify(response, null, 2)}
			</pre>
		</div>
	);
}
