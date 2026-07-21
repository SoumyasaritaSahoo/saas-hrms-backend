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
  tableName: 'email_verifications',
  underscored: true,
})
export class EmailVerification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING(255))
  declare hashed_token: string;

  @Column(DataType.ENUM('email_verify', 'password_reset'))
  declare type: string;

  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.DATE)
  declare verified_at: Date | null;

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

  @BelongsTo(() => User)
  declare user: User;
}
