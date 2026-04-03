export const AUTH_UI_LABELS = {
    login: {
        username: 'Username',
        password: 'Password',
        usernameExample: 'e.g. admin',
        passwordPlaceholder: '••••••••',
        signInToEngine: 'Sign In to Engine',
        failedToConnect: 'Failed to connect to server',
    },
    settings: {
        badge: 'Configuration',
        title: 'User Security',
        subtitle: 'Manage your digital identity and access credentials.',
        dashboard: 'Dashboard',
    },
    identity: {
        title: 'Identity',
        usernameLabel: 'Username',
        usernamePlaceholder: 'Enter your username',
        updateButton: 'Update Identity',
    },
    credentials: {
        title: 'Credentials',
        currentPasswordLabel: 'Current Password',
        newPasswordLabel: 'New Password',
        confirmLabel: 'Confirm New Password',
        changeButton: 'Change Credentials',
        passwordPlaceholder: '••••••••',
    },
    dangerZone: {
        title: 'System Access',
        subtitle: 'End your current administrator session.',
        signOut: 'Sign Out',
    },
    validation: {
        passwordsDoNotMatch: 'Passwords do not match',
    },
    messages: {
        profileUpdated: 'Username updated successfully!',
        profileUpdateFailed: 'Update failed',
        passwordChanged: 'Password changed successfully!',
        passwordChangeFailed: 'Failed to change password',
        errorOccurred: 'An error occurred',
    },
} as const;
