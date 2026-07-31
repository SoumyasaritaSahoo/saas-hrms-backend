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

import { Company } from './company.model';
import { User } from './user.model';

@Table({
  tableName: 'audit_logs',
  paranoid: true,
  underscored: true,
})
export class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  // ─────────────────────────────────────────────
  // Foreign Keys
  // ─────────────────────────────────────────────

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare company_id: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare actor_id: string | null;

  // ─────────────────────────────────────────────
  // Fields
  // ─────────────────────────────────────────────

  @Column({
    type: DataType.ENUM('user', 'saas_admin', 'system'),
    allowNull: false,
  })
  declare actor_type: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare action: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare resource_type: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare resource_id: string | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare old_values: object | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare new_values: object | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare ip_address: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare user_agent: string | null;

  // ─────────────────────────────────────────────
  // Timestamps
  // ─────────────────────────────────────────────

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  // ─────────────────────────────────────────────
  // Audit Fields
  // ─────────────────────────────────────────────

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare created_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare updated_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare deleted_by: string | null;

  // ─────────────────────────────────────────────
  // Associations
  // ─────────────────────────────────────────────

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => User, 'actor_id')
  declare actor: User;

  @BelongsTo(() => User, 'created_by')
  declare creator: User;

  @BelongsTo(() => User, 'updated_by')
  declare updater: User;

  @BelongsTo(() => User, 'deleted_by')
  declare deleter: User;
}
