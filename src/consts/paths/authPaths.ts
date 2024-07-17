const authPaths = {
  ROOT: '/api/auth',
  BASE: '/',
  IMPORT: '/import',
  REGISTER: '/register',
  SIGNIN: '/signin',
  ACTIVATE: '/activate/:link',
  VALIDATE_RESET_PSW: '/validate-reset-psw/:link',
  CHANGE_PASSWORD: '/change-password',
  CREATE_PASSWORD: '/create-password',
  RESTORE_USER: '/restore-user',
  REFRESH_USER: '/refresh-user',
  LOGOUT: '/logout',
  RECOVER_CREDENTIALS: '/recover-credentials',
};

export default authPaths;
