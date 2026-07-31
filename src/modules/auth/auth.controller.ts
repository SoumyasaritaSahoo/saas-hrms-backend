import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { successResponse } from '../../common/helpers/helper';
import {
  getAdminRoute,
  getAppRoute,
  getCommonRoute,
} from '../../common/helpers/helper';
import { MailService } from '../mail/mail.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Get('test-mail')
  async testMail() {
    await this.mailService.sendTestMail('sapan.shah@techrayslabs.com');
    return successResponse({
      message: 'Mail sent successfully',
    });
  }

  @Post(getAppRoute('register'))
  async register(@Req() req, @Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);

    // Establish a server-side session for web clients (same as login)
    if (req.clientType === 'web') {
      const sessionUser = {
        id: result.user.id,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        type: 'user',
      };
      await new Promise((resolve, reject) => {
        req.login(sessionUser, (err) => {
          if (err) reject(err);
          resolve(true);
        });
      });
    }

    await this.mailService.sendVerificationEmail(
      result.user.email,
      result.user.full_name,
      result.verifyUrl,
    );

    const isDev = process.env.NODE_ENV === 'development';

    return successResponse({
      message: 'Account created successfully',
      data: {
        token: result.token,
        user: result.user,
        ...(isDev ? { verifyUrl: result.verifyUrl, verifyToken: result.verifyToken } : {}),
      },
    });
  }

  @Post(getAppRoute('verify_email'))
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);

    return successResponse({
      message: 'Email verified successfully',
    });
  }

  @Post(getAppRoute('resend_verification'))
  async resendVerification(@Body() dto: ResendVerificationDto) {
    const { user, verifyUrl, alreadyVerified } =
      await this.authService.resendVerificationEmail(dto.email);

    if (!alreadyVerified && verifyUrl) {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.full_name,
        verifyUrl,
      );
    }

    const isDev = process.env.NODE_ENV === 'development';

    return successResponse({
      message: alreadyVerified
        ? 'This email is already verified'
        : 'Verification link sent to your email',
      data: isDev && !alreadyVerified ? { verifyUrl } : undefined,
    });
  }

  @Post(getAppRoute('login'))
  async login(@Req() req, @Body() dto: LoginDto) {
    const user = await this.authService.validateMainUser(
      dto.email,
      dto.password,
    );

    // WEB LOGIN
    if (req.clientType === 'web') {
      await new Promise((resolve, reject) => {
        req.login(user, (err) => {
          if (err) reject(err);

          resolve(true);
        });
      });

      return successResponse({
        message: 'Login successful',
        data: user,
      });
    }

    // MOBILE LOGIN
    const token = this.authService.generateToken(user);

    return successResponse({
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  }

  @Post(getAdminRoute('login'))
  async adminLogin(@Req() req, @Body() dto: LoginDto) {
    const user = await this.authService.validateAdminUser(
      dto.email,
      dto.password,
    );

    await new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) reject(err);

        resolve(true);
      });
    });

    return successResponse({
      message: 'Admin login successful',
      data: user,
    });
  }

  @Post(getAppRoute('logout'))
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    await new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      req.session?.destroy(() => {
        resolve();
      });
    });

    res.clearCookie(process.env.SESSION_NAME);

    return successResponse({
      message: 'Logout successful',
    });
  }

  @Post(getAdminRoute('logout'))
  async adminLogout(@Req() req, @Res({ passthrough: true }) res) {
    await new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      req.session?.destroy(() => {
        resolve();
      });
    });

    res.clearCookie(process.env.SESSION_NAME);

    return successResponse({
      message: 'Admin logout successful',
    });
  }

  @Post(getAppRoute('forgotPassword'))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const { user, resetUrl, token } = await this.authService.forgotPassword(
      dto.email,
      'app',
    );

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetUrl,
    );

    const isDev = process.env.NODE_ENV === 'development';

    return successResponse({
      message: 'Password reset link sent to your email',
      data: isDev ? { resetUrl, token } : undefined,
    });
  }

  @Post(getAdminRoute('forgotPassword'))
  async adminForgotPassword(@Body() dto: ForgotPasswordDto) {
    const { user, resetUrl, token } = await this.authService.forgotPassword(
      dto.email,
      'admin',
    );

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetUrl,
    );

    const isDev = process.env.NODE_ENV === 'development';

    return successResponse({
      message: 'Password reset link sent to your email',
      data: isDev ? { resetUrl, token } : undefined,
    });
  }

  @Post(getAppRoute('resetPassword'))
  async resetPassword(@Req() req, @Body() dto: ResetPasswordDto) {
    const user = await this.authService.resetPassword(dto.token, dto.password, 'app');

    if (req.clientType === 'web') {
      await new Promise((resolve, reject) => {
        req.login(
          { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, type: 'user' },
          (err) => {
            if (err) reject(err);
            resolve(true);
          },
        );
      });
    }

    return successResponse({
      message: 'Password reset successfully',
    });
  }

  @Post(getAdminRoute('resetPassword'))
  async adminResetPassword(@Req() req, @Body() dto: ResetPasswordDto) {
    const user = await this.authService.resetPassword(dto.token, dto.password, 'admin');

    await new Promise((resolve, reject) => {
      req.login(
        { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, type: 'admin' },
        (err) => {
          if (err) reject(err);
          resolve(true);
        },
      );
    });

    return successResponse({
      message: 'Password reset successfully',
    });
  }
}
