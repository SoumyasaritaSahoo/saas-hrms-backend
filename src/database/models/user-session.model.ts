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

import { User } from './user.model';
import { Company } from './company.model';

@Table({
  tableName: 'user_sessions',
  underscored: true,
  paranoid: false,
})
export class UserSession extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @Column(DataType.TEXT)
  declare token: string;

  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.DATE)
  declare revoked_at: Date | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Company)
  declare company: Company;
}
