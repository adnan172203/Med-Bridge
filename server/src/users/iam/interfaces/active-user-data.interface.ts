import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  /** user id */
  sub: string;
  /** user email */
  email: string;
  /** user role */
  role: Role;
  /** user permissions */
  // permissions: PermissionType[];
}
