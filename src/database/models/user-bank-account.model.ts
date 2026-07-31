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
  tableName: 'user_bank_accounts',
  paranoid: true,
  underscored: true,
})
export class UserBankAccount extends Model {
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

  @Column(DataType.STRING(255))
  declare bank_name: string | null;

  @Column(DataType.STRING(255))
  declare account_holder_name: string | null;

  @Column(DataType.STRING(100))
  declare account_number: string | null;

  @Column(DataType.STRING(255))
  declare branch_name: string | null;

  @Column(DataType.STRING(100))
  declare ifsc_code: string | null;

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
