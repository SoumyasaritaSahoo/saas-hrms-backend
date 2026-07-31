import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import {
  getAdminRoute,
  getAppRoute,
  successResponse,
} from '../../common/helpers/helper';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

const IMAGE_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) {
      cb(new BadRequestException('Only PNG or JPG images are allowed'), false);
      return;
    }
    cb(null, true);
  },
};

const USER_DOCUMENTS_DIR = join(
  process.cwd(),
  'public',
  'uploads',
  'user-documents',
);

const userDocumentsStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(USER_DOCUMENTS_DIR)) {
      mkdirSync(USER_DOCUMENTS_DIR, { recursive: true });
    }
    cb(null, USER_DOCUMENTS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${randomUUID()}-${safeName}`);
  },
});

// NOTE: the source project's UserController also exposed SaaS admin user
// CRUD (findAll/findOne/create/update/remove under saas-users routes) and
// the SaaS admin's own profile endpoints — those belong to the separate
// SaaS-platform-admin console (out of scope for Employee management) and
// are intentionally NOT ported here, per the porting brief. The
// self/admin-profile endpoints below are kept exactly as they were in the
// prior auth-only port; every employee CRUD endpoint below them is newly
// added, copied verbatim from the source's UserController.
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('profile'))
  async getProfile(@Req() req) {
    const user = await this.userService.getUserProfile(req.user.id);
    return successResponse({
      message: 'Profile fetched successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('profile'))
  async updateMyProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    const user = await this.userService.updateProfile(req.user.id, dto);
    return successResponse({
      message: 'Profile updated successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('profile_picture'))
  @UseInterceptors(FileInterceptor('file', IMAGE_UPLOAD_OPTIONS))
  async uploadMyPicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const user = await this.userService.updateProfilePicture(req.user.id, file);
    return successResponse({
      message: 'Profile picture updated successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('profile_picture'))
  async removeMyPicture(@Req() req) {
    const user = await this.userService.removeProfilePicture(req.user.id);
    return successResponse({
      message: 'Profile picture removed successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('profile_documents'))
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: userDocumentsStorage }),
  )
  async uploadMyDocuments(
    @Req() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('documents') documentsJson: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    let meta: { type: string; title?: string }[];
    try {
      meta = JSON.parse(documentsJson || '[]');
    } catch {
      throw new BadRequestException('documents must be valid JSON');
    }

    if (!Array.isArray(meta) || meta.length !== files.length) {
      throw new BadRequestException(
        'documents metadata must match the number of files',
      );
    }

    const items = files.map((file, index) => ({
      type: meta[index]?.type,
      title: meta[index]?.title ?? null,
      file_path: `/uploads/user-documents/${file.filename}`,
    }));

    const user = await this.userService.addUserDocuments(
      req.user.id,
      req.headers['company-id'],
      items,
    );
    return successResponse({
      message: 'Documents uploaded successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('profile_document_detail'))
  async removeMyDocument(@Req() req, @Param('documentId') documentId: string) {
    const user = await this.userService.removeUserDocument(
      req.user.id,
      req.headers['company-id'],
      documentId,
    );
    return successResponse({
      message: 'Document deleted successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('profile_document_detail'))
  async updateMyDocument(
    @Req() req,
    @Param('documentId') documentId: string,
    @Body() body: { type?: string; title?: string },
  ) {
    const user = await this.userService.updateUserDocument(
      req.user.id,
      req.headers['company-id'],
      documentId,
      body,
    );
    return successResponse({
      message: 'Document updated successfully',
      data: user,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get(getAdminRoute('profile'))
  async getAdminProfile(@Req() req) {
    const user = await this.userService.getAdminProfile(req.user.id);
    return successResponse({
      message: 'Profile fetched successfully',
      data: user,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Put(getAdminRoute('profile'))
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const user = await this.userService.updateAdminProfile(req.user.id, dto);
    return successResponse({
      message: 'Profile updated successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.view', 'employees.view-team')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Get(getAppRoute('users'))
  async findAllUsers(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('department_id') departmentId?: string,
    @Query('designation_id') designationId?: string,
    @Query('role_id') roleId?: string,
    @Query('manager_id') managerId?: string,
    @Query('status') status?: string,
  ) {
    const statusValue =
      status === 'true' ? true : status === 'false' ? false : undefined;
    const result = await this.userService.findAllUsers(
      req.headers['company-id'],
      req.user.id,
      req.user.permissions,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
      departmentId || undefined,
      designationId || undefined,
      roleId || undefined,
      managerId || undefined,
      statusValue,
    );
    return successResponse({
      message: 'Users fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @RequirePermissions(
    'employees.view',
    'employees.view-team',
    'employees.view-details',
  )
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Get(getAppRoute('user_detail'))
  async findOneUser(@Req() req, @Param('id') id: string) {
    const user = await this.userService.getEmployeeById(
      id,
      req.headers['company-id'],
      req.user.id,
      req.user.permissions,
    );
    return successResponse({
      message: 'User fetched successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.create')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Post(getAppRoute('create_user'))
  async createUser(@Req() req, @Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'User created successfully',
      data: user,
      statusCode: 201,
    });
  }

  @RequirePermissions('employees.update')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Put(getAppRoute('update_user'))
  async updateUser(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(
      id,
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'User updated successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.update')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Post(getAppRoute('upload_user_documents'))
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: userDocumentsStorage }),
  )
  async uploadUserDocuments(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('documents') documentsJson: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    let meta: { type: string; title?: string }[];
    try {
      meta = JSON.parse(documentsJson || '[]');
    } catch {
      throw new BadRequestException('documents must be valid JSON');
    }

    if (!Array.isArray(meta) || meta.length !== files.length) {
      throw new BadRequestException(
        'documents metadata must match the number of files',
      );
    }

    const items = files.map((file, index) => ({
      type: meta[index]?.type,
      title: meta[index]?.title ?? null,
      file_path: `/uploads/user-documents/${file.filename}`,
    }));

    const user = await this.userService.addUserDocuments(
      id,
      req.headers['company-id'],
      items,
    );
    return successResponse({
      message: 'Documents uploaded successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.update')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Delete(getAppRoute('remove_user_document'))
  async removeUserDocument(
    @Req() req,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    const user = await this.userService.removeUserDocument(
      id,
      req.headers['company-id'],
      documentId,
    );
    return successResponse({
      message: 'Document deleted successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.update')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Put(getAppRoute('remove_user_document'))
  async updateUserDocument(
    @Req() req,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() body: { type?: string; title?: string },
  ) {
    const user = await this.userService.updateUserDocument(
      id,
      req.headers['company-id'],
      documentId,
      body,
    );
    return successResponse({
      message: 'Document updated successfully',
      data: user,
    });
  }

  @RequirePermissions('employees.delete')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Delete(getAppRoute('remove_user'))
  async removeUser(@Req() req, @Param('id') id: string) {
    await this.userService.removeUser(
      id,
      req.headers['company-id'],
      req.user.id,
    );
    return successResponse({
      message: 'User deleted successfully',
    });
  }

  @RequirePermissions('employees.view', 'employees.view-team')
  @UseGuards(UserAuthGuard, PermissionsGuard)
  @Get(getAppRoute('get_all_users'))
  async getAllUsers(@Req() req) {
    const users = await this.userService.getAllUsers(
      req.headers['company-id'],
      req.user.id,
      req.user.permissions,
    );
    return successResponse({
      message: 'Users fetched successfully',
      data: users,
    });
  }
}
