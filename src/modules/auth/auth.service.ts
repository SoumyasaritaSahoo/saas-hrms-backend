import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../../database/models/user.model';

import { SaasUser } from '../../database/models/saas/saas-user.model';
import { SaasEmailVerification } from '../../database/models/saas/saas-email-verification.model';

import { EmailVerification } from '../../database/models/email-verification.model';

import { UserSession } from '../../database/models/user-session.model';

import { CompanyService } from '../company/company.service';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(SaasUser)
    private readonly saasUserModel: typeof SaasUser,

    @InjectModel(EmailVerification)
    private readonly emailVerificationModel: typeof EmailVerification,

    @InjectModel(SaasEmailVerification)
    private readonly saasEmailVerificationModel: typeof SaasEmailVerification,

    @InjectModel(UserSession)
    private readonly userSessionModel: typeof UserSession,

    private readonly jwtService: JwtService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
  ) {}

  private getResetConfig(clientType: 'app' | 'admin') {
    const isAdmin = clientType === 'admin';
    return {
      userModel: (isAdmin ? this.saasUserModel : this.userModel) as any,
      verificationModel: (isAdmin
        ? this.saasEmailVerificationModel
        : this.emailVerificationModel) as any,
      frontendUrl: isAdmin
        ? process.env.ADMIN_FRONTEND_URL
        : process.env.FRONTEND_URL,
      userIdField: isAdmin ? 'saas_user_id' : ('user_id' as const),
      revokeSessions: !isAdmin,
    };
  }

  private generateAlphanumeric(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.randomBytes(length))
      .map((b) => chars[b % chars.length])
      .join('');
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email },
      paranoid: false,
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const identifier = this.generateAlphanumeric(12);
    const emailDomain = dto.email.split('@')[1] ?? '';
    const rawName = emailDomain.split('.')[0] ?? identifier;
    const companyName = rawName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const { user } = await this.companyService.createForRegistration({
      companyName: companyName,
      emailDomain,
      user: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        middle_name: dto.middle_name ?? null,
        email: dto.email,
        password: dto.password,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      type: 'user',
    });

    const profile = await this.userService.getUserProfile(user.id);

    return { token, user: profile };
  }

  async validateMainUser(email: string, password: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      type: 'user',
    };
  }

  async validateAdminUser(email: string, password: string) {
    const user = await this.saasUserModel.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      type: 'admin',
    };
  }

  generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      type: 'user',
    });
  }

  async forgotPassword(email: string, clientType: 'app' | 'admin') {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const config = this.getResetConfig(clientType);

    const user = await config.userModel.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    await config.verificationModel.create({
      [config.userIdField]: user.id,
      type: 'password_reset',
      hashed_token: tokenHash,
      expires_at: expiresAt,
    });

    const resetUrl = `${config.frontendUrl}/en/reset-password?token=${token}`;

    return { user, resetUrl, token };
  }

  async resetPassword(
    token: string,
    password: string,
    clientType: 'app' | 'admin',
  ) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const config = this.getResetConfig(clientType);

    const verification = await config.verificationModel.findOne({
      where: {
        hashed_token: tokenHash,
        type: 'password_reset',
        verified_at: null,
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > new Date(verification.expires_at)) {
      throw new BadRequestException('Reset token has expired');
    }

    const user = await config.userModel.findByPk(
      verification[config.userIdField],
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    verification.verified_at = new Date();
    await verification.save();

    if (config.revokeSessions) {
      await this.userSessionModel.update(
        { revoked_at: new Date() },
        { where: { user_id: user.id, revoked_at: null } },
      );
    }

    return user;
  }
}
