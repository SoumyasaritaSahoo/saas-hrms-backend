import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Company } from './company.model';

@Table({
  tableName: 'designations',
  paranoid: true,
  underscored: true,
})
export class Designation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare company_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare level: number | null;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare created_by: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare updated_by: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare deleted_by: string | null;

  // Relations

  @BelongsTo(() => Company)
  declare company: Company;
}
