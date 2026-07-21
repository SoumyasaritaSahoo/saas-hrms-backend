import { INDUSTRY_LABELS } from '../constants/industry.constants';
import { ROUTES } from '../constants/routes.constant';

// NOTE: the source project's helper.ts also exported getPermission /
// getPermissionLabel / getPermissionDescription / getPermissionsByGroup /
// getAllPermissions / getAllPermissionGroups, backed by
// common/constants/permission.constants.ts. Those were dropped along with
// the permission/role feature modules, which were the only callers.

export function getAdminRoute(value: string): string {
  return ROUTES.admin[value] || value;
}

export function getAppRoute(value: string): string {
  return ROUTES.app[value] || value;
}

export function getCommonRoute(value: string): string {
  return ROUTES.common[value] || value;
}

export const getAllRoutes = (): string[] => {
  return [
    ...Object.values(ROUTES.admin),
    ...Object.values(ROUTES.app),
    ...Object.values(ROUTES.common),
  ];
};

export function getIndustryLabel(value: string): string {
  return INDUSTRY_LABELS[value] || value;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: any;
  meta?: any;
  statusCode: number;
}

export const successResponse = <T = any>({
  message = 'Success',
  data = null,
  meta = null,
  statusCode = 200,
}: {
  message?: string;
  data?: T | null;
  meta?: any;
  statusCode?: number;
}): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    meta,
    statusCode,
  };
};

export const errorResponse = ({
  message = 'Something went wrong',
  errors = null,
  statusCode = 500,
}: {
  message?: string;
  errors?: any;
  statusCode?: number;
}): ApiResponse<null> => {
  return {
    success: false,
    message,
    data: null,
    errors,
    statusCode,
  };
};

export const getMailAssetUrl = (path: string) => {
  return `${process.env.APP_URL}/${path}`;
};
