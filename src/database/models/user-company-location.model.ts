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
import { Location } from './location.model';

@Table({
  tableName: 'user_company_locations',
  paranoid: true,
  underscored: true,
})
export class UserCompanyLocation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => Location)
  @Column(DataType.UUID)
  declare location_id: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_primary: boolean;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Location)
  declare location: Location;
}
