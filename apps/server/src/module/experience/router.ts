import Elysia from "elysia";
import { experienceModel } from "./schema";
import { createExperience, deleteExperience, getExperience, getExperiences, updateExperience } from "./service";

export const experienceRouter = new Elysia({
        prefix: '/experience',
        tags: ['experience'],
    })
    .use(experienceModel)
	.get("/", () => {
        const result = getExperiences()
        return result
    }, {
        query: 'experience.query',
        detail: {
            summary: 'Get all experiences',
            description: 'Returns all experiences from the database.',
        }
    })
    .post('/', ({ body }) => {
        const result = createExperience({ data: body })
        return result
    }, {
        body: 'experience.create',
        detail: {
            summary: 'Add a experience',
            description: 'Creates and stores a new experience with the provided details.',
        }
    })
    .get('/:experienceId', ({ params }) => {
        const result = getExperience({ id: params.experienceId })
        return result
    }, {
        params: 'experience.identifier.params',
        detail: {
            summary: 'Get a experience by id',
            description: 'Returns a experience by id from the database.',
        }
    })
    .put('/:experienceId', ({ params, body }) => {
        const result = updateExperience({ id: params.experienceId, data: body })
        return result
    }, {
        params: 'experience.identifier.params',
        body: 'experience.update',
        detail: {
            summary: 'Update a experience by id',
            description: 'Updates a experience by id in the database using the provided details.',
        }
    })
    .delete('/:experienceId', ({ params }) => {
        const result = deleteExperience({ id: params.experienceId })
        return result
    }, {
        params: 'experience.identifier.params',
        detail: {
            summary: 'Delete a experience by id',
            description: 'Deletes a experience by id from the database.',
        }
    });