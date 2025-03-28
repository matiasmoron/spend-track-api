import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { status, statusId } from './status';

export interface exampleAttributes {
  id_example: number;
  name?: string;
  id_status: number;
}

export type examplePk = 'id_example';
export type exampleId = example[examplePk];
export type exampleOptionalAttributes = 'id_example' | 'name';
export type exampleCreationAttributes = Optional<exampleAttributes, exampleOptionalAttributes>;

export class example
  extends Model<exampleAttributes, exampleCreationAttributes>
  implements exampleAttributes
{
  id_example!: number;
  name?: string;
  id_status!: number;

  // example belongsTo status via id_status
  id_status_status!: status;
  getId_status_status!: Sequelize.BelongsToGetAssociationMixin<status>;
  setId_status_status!: Sequelize.BelongsToSetAssociationMixin<status, statusId>;
  createId_status_status!: Sequelize.BelongsToCreateAssociationMixin<status>;

  static initModel(sequelize: Sequelize.Sequelize): typeof example {
    return example.init(
      {
        id_example: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        id_status: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'status',
            key: 'id_status',
          },
        },
      },
      {
        sequelize,
        tableName: 'example',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_example' }],
          },
          {
            name: 'fk_example_status_idx',
            using: 'BTREE',
            fields: [{ name: 'id_status' }],
          },
        ],
      }
    );
  }
}
