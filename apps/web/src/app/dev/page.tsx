import { eden } from "@web/lib/eden";
import Response from "./feature/response";

export default async function DevPage() {
	const experiences = await eden.experience.get({ $query: {} });
	const createCategories = await eden.category.get({
		$query: { limit: 10, offset: 0 },
	});

	return (
		<div className="flex min-h-dvh flex-col gap-y-4 bg-black py-10">
			<Response response={experiences} title="Experiences" />
			<Response response={createCategories} title="Categories" />
		</div>
	);
}
