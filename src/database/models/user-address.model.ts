import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'user_addresses',
  paranoid: true,
  underscored: true,
})
export class UserAddress extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @Column({
    type: DataType.ENUM('current', 'permanent'),
    allowNull: false,
  })
  declare type: string;

  @Column(DataType.STRING(255))
  declare address_line_1: string | null;

  @Column(DataType.STRING(255))
  declare address_line_2: string | null;

  @Column(DataType.STRING(100))
  declare city: string | null;

  @Column(DataType.STRING(100))
  declare state: string | null;

  @Column(DataType.STRING(100))
  declare pincode: string | null;

  @Column(DataType.STRING(100))
  declare country: string | null;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare created_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare updated_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare deleted_by: string | null;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => User, 'created_by')
  declare creator: User;

  @BelongsTo(() => User, 'updated_by')
  declare updater: User;

  @BelongsTo(() => User, 'deleted_by')
  declare deleter: User;
}
