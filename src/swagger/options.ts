import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { getExamples } from './example.swagger';

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000/api-docs',
      },
    ],
    tags: [
      {
        name: 'Example',
      },
    ],
    paths: {
      '/example': {
        get: getExamples,
      },
    },
  },
  apis: [`${path.join(__dirname, '../swagger/*.swagger.ts')}`],
};
