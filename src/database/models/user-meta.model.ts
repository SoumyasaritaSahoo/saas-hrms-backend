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

@Table({
  tableName: 'user_meta',
  paranoid: true,
  underscored: true,
})
export class UserMeta extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING(255))
  declare meta_key: string;

  @Column(DataType.TEXT)
  declare meta_value: string | null;

  @BelongsTo(() => User)
  declare user: User;
}
