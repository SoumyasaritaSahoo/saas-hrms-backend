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
  tableName: 'company_meta',
  paranoid: true,
  underscored: true,
})
export class CompanyMeta extends Model {
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
  declare meta_key: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare meta_value: string | null;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @BelongsTo(() => Company)
  declare company: Company;
}
