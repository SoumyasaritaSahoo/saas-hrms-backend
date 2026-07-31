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
} from 'sequelize-typescript';

import { HolidayCalendar } from './holiday-calendar.model';
import { User } from './user.model';

@Table({
  tableName: 'holidays',
  paranoid: true,
  underscored: true,
})
export class Holiday extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => HolidayCalendar)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare calendar_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare date: string;

  @Column({
    type: DataType.ENUM('official', 'optional'),
    allowNull: false,
  })
  declare type: 'official' | 'optional';

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare is_restricted: boolean;

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

  @BelongsTo(() => HolidayCalendar)
  declare calendar: HolidayCalendar;
}
