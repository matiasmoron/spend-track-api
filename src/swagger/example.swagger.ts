/**
 * @swagger
 * components:
 *  schemas:
 *   Example:
 *    type: object
 *    properties:
 *     id_example:
 *      type: string
 *      description: The unique identifier for the example
 *     name:
 *      type: string
 *      description: The name of the example
 *    required:
 *     - id
 *     - name
 *    example:
 *    id: 5f6f8f8f-8f8f-8f8f-8f8f-8f8f8f8f8f8f
 *    name: 'example Name'
 */

export const getExamples = {
  tags: ['Examples'],
  description: 'Returns all entries from the system that are active',
  operationId: 'getExamples',
  responses: {
    '200': {
      description: 'A list of Examples.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Example',
            },
          },
        },
      },
    },
  },
};
