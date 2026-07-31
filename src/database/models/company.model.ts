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

import { Industry } from './industry.model';
import { SaasUser } from './saas/saas-user.model';
import { User } from './user.model';
import { CompanyMeta } from './company-meta.model';
import { LocationType } from './location-type.model';
import { Location } from './location.model';

@Table({
  tableName: 'companies',
  paranoid: true,
  underscored: true,
})
export class Company extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Industry)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare industry_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare email_domain: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare logo: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare website: string | null;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare country: string;

  @Default('INR')
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare currency: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare status: boolean;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare gst_number: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare pan_number: string | null;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare is_setup: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  // Audit Fields

  @ForeignKey(() => SaasUser)
  @Column(DataType.UUID)
  declare created_by: string | null;

  @ForeignKey(() => SaasUser)
  @Column(DataType.UUID)
  declare updated_by: string | null;

  @ForeignKey(() => SaasUser)
  @Column(DataType.UUID)
  declare deleted_by: string | null;

  // Relations

  @BelongsTo(() => Industry)
  declare industry: Industry;

  @BelongsTo(() => SaasUser, 'created_by')
  declare creator: SaasUser;

  @BelongsTo(() => SaasUser, 'updated_by')
  declare updater: SaasUser;

  @BelongsTo(() => SaasUser, 'deleted_by')
  declare deleter: SaasUser;

  @HasMany(() => CompanyMeta)
  declare meta: CompanyMeta[];

  @HasMany(() => LocationType)
  declare location_types: LocationType[];

  @HasMany(() => Location)
  declare locations: Location[];

  @HasMany(() => User)
  declare users: User[];
}
