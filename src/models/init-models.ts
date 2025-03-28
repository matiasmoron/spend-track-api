import type { Sequelize } from 'sequelize';
import { example as _example } from './example';
import type { exampleAttributes, exampleCreationAttributes } from './example';
import { status as _status } from './status';
import type { statusAttributes, statusCreationAttributes } from './status';

export { _example as example, _status as status };

export type {
  exampleAttributes,
  exampleCreationAttributes,
  statusAttributes,
  statusCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const example = _example.initModel(sequelize);
  const status = _status.initModel(sequelize);

  example.belongsTo(status, { foreignKey: 'id_status' });
  status.hasMany(example, { foreignKey: 'id_status' });

  return {
    example: example,
    status: status,
  };
}
