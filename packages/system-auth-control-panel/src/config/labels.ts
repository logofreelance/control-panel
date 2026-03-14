export const AUTH_LABELS = {
    // User interface messages for auth operations
    messages: {
        invalidCredentials: 'AUTH.ERRORS.INVALID_CREDENTIALS',
        accountDisabled: 'AUTH.ERRORS.ACCOUNT_DISABLED',
        noTokenProvided: 'AUTH.ERRORS.NO_TOKEN',
        loginFailed: 'AUTH.ERRORS.LOGIN_FAILED',
        registrationFailed: 'AUTH.ERRORS.REGISTRATION_FAILED',
        requiredFields: 'AUTH.ERRORS.REQUIRED_FIELDS',
        adminNotFound: 'AUTH.ERRORS.ADMIN_NOT_FOUND',
        wrongPassword: 'AUTH.ERRORS.WRONG_PASSWORD',
        usernameUpdated: 'AUTH.SUCCESS.USERNAME_UPDATED',
        passwordChangeFailed: 'AUTH.ERRORS.PASSWORD_CHANGE_FAILED',
        profileUpdateFailed: 'AUTH.ERRORS.PROFILE_UPDATE_FAILED',
        loggedOut: 'AUTH.SUCCESS.LOGGED_OUT',
        tokenInvalid: 'AUTH.ERRORS.TOKEN_INVALID',
        alreadyExists: 'AUTH.ERRORS.ALREADY_EXISTS',
        registered: 'AUTH.SUCCESS.REGISTERED',
        passwordChanged: 'AUTH.SUCCESS.PASSWORD_CHANGED',
        passwordTooShort: 'AUTH.ERRORS.PASSWORD_TOO_SHORT',
        profileUpdated: 'AUTH.SUCCESS.PROFILE_UPDATED'
    }
} as const;
