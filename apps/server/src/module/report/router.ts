import Elysia from "elysia";
import { reportModel } from "./model";
import { createReport } from "./service";

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
		description: 'Creates and stores a new report with the provided details from the experience form.',
	}
});
