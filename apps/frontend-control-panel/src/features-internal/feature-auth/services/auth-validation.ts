export function validatePasswordMatch(newPassword: string, confirmPassword: string): boolean {
    return newPassword === confirmPassword;
}
