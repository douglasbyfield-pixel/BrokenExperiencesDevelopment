import Elysia from "elysia";
import { reportModel } from "./model";
import { createReport, getReport } from "./service";

export const reportRouter = new Elysia({
	prefix: '/report',
	tags: ['Report'],
})
.use(reportModel)
.post('/', ({ body }) => {
	const result = createReport({ data: body });
	return result;
}, {
	body: 'report.create',
	detail: {
		summary: 'Create a new report',
		description: 'Creates and stores a new report with the provided details from the broken experience form.',
	}
})
.get('/:id', ({ params }) => {
	const result = getReport({ id: params.id });
	return result;
}, {
	params: 'report.identifier.params',
	detail: {
		summary: 'Get a report by ID',
		description: 'Retrieves a specific report by its ID, including images and verification status.',
	}
});
