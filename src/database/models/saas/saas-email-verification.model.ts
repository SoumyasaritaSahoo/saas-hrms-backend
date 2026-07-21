import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { SaasUser } from './saas-user.model';

@Table({
  tableName: 'saas_email_verifications',
  underscored: true,
  paranoid: false,
  timestamps: true,
})
export class SaasEmailVerification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => SaasUser)
  @Column(DataType.UUID)
  declare saas_user_id: string;

  @Column(DataType.STRING(255))
  declare hashed_token: string;

  @Column(DataType.ENUM('password_reset'))
  declare type: string;

  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.DATE)
  declare verified_at: Date | null;

  @BelongsTo(() => SaasUser)
  declare saas_user: SaasUser;
}
