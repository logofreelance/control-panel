export interface AdminUserData {
    id: number;
    username: string;
    passwordHash: string;
    createdAt?: Date;
}

export interface IAuthRepository {
    findAdminByUsername(username: string): Promise<AdminUserData | null>;
    findAdminById(id: number): Promise<AdminUserData | null>;
    updateAdmin(id: number, data: Partial<AdminUserData>): Promise<void>;
}
