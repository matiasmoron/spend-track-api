import { exampleCreationAttributes, exampleAttributes } from './../../../models/example';

export type ExampleCreate = Omit<exampleCreationAttributes, 'id_status'>;
export type Example = exampleAttributes;
