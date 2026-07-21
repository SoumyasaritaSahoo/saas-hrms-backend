// Trimmed from the source project: only routes actually used by the
// auth / user / company modules ported into this scaffold are kept.
// (Routes for leave, attendance, holidays, roles, locations, etc. were
// dropped along with the feature modules that served them.)
export const ADMIN_ROUTE_PREFIX = 'admin';
export const APP_ROUTE_PREFIX = 'app';

export const ROUTES = {
  admin: {
    login: `${ADMIN_ROUTE_PREFIX}/login`,
    logout: `${ADMIN_ROUTE_PREFIX}/logout`,
    forgotPassword: `${ADMIN_ROUTE_PREFIX}/forgot-password`,
    resetPassword: `${ADMIN_ROUTE_PREFIX}/reset-password`,
    profile: `${ADMIN_ROUTE_PREFIX}/profile`,
    companies: `${ADMIN_ROUTE_PREFIX}/companies`,
    company_detail: `${ADMIN_ROUTE_PREFIX}/companies/:id`,
  },

  app: {
    login: `${APP_ROUTE_PREFIX}/login`,
    logout: `${APP_ROUTE_PREFIX}/logout`,
    forgotPassword: `${APP_ROUTE_PREFIX}/forgot-password`,
    resetPassword: `${APP_ROUTE_PREFIX}/reset-password`,
    profile: `${APP_ROUTE_PREFIX}/profile`,
    register: `${APP_ROUTE_PREFIX}/register`,
    update_company: `${APP_ROUTE_PREFIX}/company/update/:id`,
    company_detail: `${APP_ROUTE_PREFIX}/company/:id`,
  },

  common: {
    home: '/',
  },
};
