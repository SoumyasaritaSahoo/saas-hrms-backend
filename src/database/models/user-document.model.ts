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
  tableName: 'user_documents',
  paranoid: true,
  underscored: true,
})
export class UserDocument extends Model {
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
    type: DataType.ENUM(
      'identity_proof',
      'experience_letter',
      'medical_certificate',
      'other',
    ),
    allowNull: false,
  })
  declare type: string;

  @Column(DataType.STRING(255))
  declare title: string | null;

  @Column(DataType.STRING(255))
  declare file_path: string | null;

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
