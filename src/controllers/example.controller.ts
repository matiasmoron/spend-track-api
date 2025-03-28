import { Example, ExampleCreate } from '../data/models/example';
import { models } from '../services/database';

const { example: ExampleModel } = models;

export const getExample = async (): Promise<Example[]> => {
  const examples = await ExampleModel.findAll();
  return examples;
};

export const addExample = async ({ name }: ExampleCreate): Promise<Example> => {
  const example = await ExampleModel.create({ name, id_status: 1 });
  return example;
};
