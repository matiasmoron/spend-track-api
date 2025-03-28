import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { example, exampleId } from './example';

export interface statusAttributes {
  id_status: number;
  name?: string;
}

export type statusPk = 'id_status';
export type statusId = status[statusPk];
export type statusOptionalAttributes = 'id_status' | 'name';
export type statusCreationAttributes = Optional<statusAttributes, statusOptionalAttributes>;

export class status
  extends Model<statusAttributes, statusCreationAttributes>
  implements statusAttributes
{
  id_status!: number;
  name?: string;

  // status hasMany example via id_status
  examples!: example[];
  getExamples!: Sequelize.HasManyGetAssociationsMixin<example>;
  setExamples!: Sequelize.HasManySetAssociationsMixin<example, exampleId>;
  addExample!: Sequelize.HasManyAddAssociationMixin<example, exampleId>;
  addExamples!: Sequelize.HasManyAddAssociationsMixin<example, exampleId>;
  createExample!: Sequelize.HasManyCreateAssociationMixin<example>;
  removeExample!: Sequelize.HasManyRemoveAssociationMixin<example, exampleId>;
  removeExamples!: Sequelize.HasManyRemoveAssociationsMixin<example, exampleId>;
  hasExample!: Sequelize.HasManyHasAssociationMixin<example, exampleId>;
  hasExamples!: Sequelize.HasManyHasAssociationsMixin<example, exampleId>;
  countExamples!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof status {
    return status.init(
      {
        id_status: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'status',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id_status' }],
          },
        ],
      }
    );
  }
}
