import {
  Column,
  DataType,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { Company } from './company.model';
import { getIndustryLabel } from '../../common/helpers/helper';

@Table({
  tableName: 'industries',
  paranoid: true,
  underscored: true,
})
export class Industry extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getIndustryLabel(this.getDataValue('name'));
    },
  })
  declare label: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date;

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

  @HasMany(() => Company, 'industry_id')
  declare companies: Company[];
}
