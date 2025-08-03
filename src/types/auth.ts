/**
 * A user in the restuarant/QSR - the user can be admin/manager/cashier/report
 * user etc
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface User {
  // Unique id of user - UUID
  id: string

  // Email address of the user
  email: string

  // First name of the user
  firstName: string

  // Optional last name of the user
  lastName?: string

  // Role id of the user
  role: 'cashier' | 'manager' | 'owner' | 'admin'

  // Outlets where the user is present
  outlets: string[]

  // Tenant Id is the entity id of the restuarant/QSR. A tenant can have multiple outlets
  tenantId: string

  // Avator of the user or even an image
  avatar?: string

  // Permissions of the user
  permissions: string[]
}

/**
 * A role in the system - the role can be assigned to a user or a system
 */
export interface Role {

  // UUID of the role
  id: string

  // Name of the role - Admin, Analyst, Partner/Owner, CA etc
  name: string

  // One or more default permissions set up for the Role. This can be
  // overridden by permissions in the user
  permissions: Permission[]
}

/**
 * A group that has one or more Roles assigned
 */
export interface Group {

  // A group iddentifier  UUID
  id: string,

  // Name of the group - Administrators, Analysts etc
  name: string

  // One or more roles assigned to the group
  roles: Role[]
}

/** 
 * A permission is an action that can be performed
 **/
export interface Permission {
  
  // Unique id of permission
  id: string

  // Permission name
  name: string

}


export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}
