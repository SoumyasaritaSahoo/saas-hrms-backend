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
  HasMany,
} from 'sequelize-typescript';

import { Company } from './company.model';
import { LocationType } from './location-type.model';
import { UserCompanyLocation } from './user-company-location.model';

@Table({
  tableName: 'locations',
  paranoid: true,
  underscored: true,
})
export class Location extends Model {
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

  @ForeignKey(() => LocationType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare location_type_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare address_line_1: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare address_line_2: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare state: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare postal_code: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare country: string;

  @Default('Asia/Kolkata')
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare timezone: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare is_active: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => LocationType)
  declare location_type: LocationType;

  @HasMany(() => UserCompanyLocation)
  declare user_company_locations: UserCompanyLocation[];
}
