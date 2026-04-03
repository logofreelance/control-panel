export type AuthPanelAdminProfile = {
    id: string;
    username: string;
    role: string;
};

export type AuthPanelLoginResult = {
    token: string;
    user: AuthPanelAdminProfile;
};
