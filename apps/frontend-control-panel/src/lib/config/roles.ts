// packages/config/src/roles.ts
// Role configuration and defaults

/**
 * Role definition interface
 */
export interface RoleDefinition {
    name: string;
    displayName: string;
    level: number;
    isSuper: boolean;
    description?: string;
}

/**
 * Default system roles
 * These are created during initial setup
 */
export const DEFAULT_ROLES: Record<string, RoleDefinition> = {
    SUPER_ADMIN: {
        name: 'super_admin',
        displayName: 'Super Administrator',
        level: 100,
        isSuper: true,
        description: 'Full system access, bypasses all RBAC checks',
    },
    ADMIN: {
        name: 'admin',
        displayName: 'Administrator',
        level: 90,
        isSuper: false,
        description: 'Administrative access to manage users and content',
    },
    MODERATOR: {
        name: 'moderator',
        displayName: 'Moderator',
        level: 50,
        isSuper: false,
        description: 'Can moderate content and manage certain resources',
    },
    USER: {
        name: 'user',
        displayName: 'User',
        level: 10,
        isSuper: false,
        description: 'Standard user with basic access',
    },
    GUEST: {
        name: 'guest',
        displayName: 'Guest',
        level: 0,
        isSuper: false,
        description: 'Unauthenticated or limited access',
    },
} as const;

/**
 * Role names that cannot be deleted or modified
 */
export const PROTECTED_ROLES = [
    'super_admin',
    'admin',
    'user',
] as const;

/**
 * Default role for new user registrations
 */
export const DEFAULT_USER_ROLE = DEFAULT_ROLES.USER.name;

/**
 * Helper: Check if a role is protected
 */
export const isProtectedRole = (roleName: string): boolean =>
    PROTECTED_ROLES.includes(roleName as typeof PROTECTED_ROLES[number]);

/**
 * Helper: Check if a role has super admin privileges
 */
export const isSuperRole = (roleName: string): boolean =>
    roleName === DEFAULT_ROLES.SUPER_ADMIN.name;

/**
 * Helper: Get role level (for priority comparison)
 */
export const getRoleLevel = (roleName: string): number => {
    const role = Object.values(DEFAULT_ROLES).find(r => r.name === roleName);
    return role?.level ?? 0;
};

/**
 * Helper: Check if roleA has higher or equal level than roleB
 */
export const hasHigherOrEqualRole = (roleA: string, roleB: string): boolean =>
    getRoleLevel(roleA) >= getRoleLevel(roleB);
