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

// NOTE: simplified from the source project. The original SaasUser model
// also declared `@HasMany(() => SaasUserRole) user_roles` and
// `@BelongsToMany(() => SaasRole, () => SaasUserRole) roles`, pulling in
// the saas-role / saas-permission feature modules — explicitly excluded
// from this auth-only port. Those associations (and the SaasRole /
// SaasUserRole / SaasRolePermission / SaasPermission models) were dropped;
// admin login/session/profile does not need role or permission data.
@Table({
  tableName: 'saas_users',
  paranoid: true,
  underscored: true,
})
export class SaasUser extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare middle_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare last_name: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return [
        this.getDataValue('first_name'),
        this.getDataValue('middle_name'),
        this.getDataValue('last_name'),
      ]
        .filter(Boolean)
        .join(' ');
    },
  })
  declare full_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare profile_picture: string | null;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare is_deletable: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare status: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  // ─────────────────────────────────────────────
  // Audit Fields
  // ─────────────────────────────────────────────

  @ForeignKey(() => SaasUser)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare created_by: string | null;

  @ForeignKey(() => SaasUser)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare updated_by: string | null;

  @ForeignKey(() => SaasUser)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare deleted_by: string | null;

  // ─────────────────────────────────────────────
  // Self Relations
  // ─────────────────────────────────────────────

  @BelongsTo(() => SaasUser, 'created_by')
  declare creator: SaasUser;

  @BelongsTo(() => SaasUser, 'updated_by')
  declare updater: SaasUser;

  @BelongsTo(() => SaasUser, 'deleted_by')
  declare deleter: SaasUser;
}
