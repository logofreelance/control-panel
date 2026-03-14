/**
 * packages/contracts/src/tokens.ts
 * Dependency Injection Tokens
 */

export const TOKENS = {
    // Services
    UserService: 'IUserService',
    RolesService: 'IRolesService',
    PermissionsService: 'IPermissionsService',
    ApiKeysService: 'IApiKeysService',
    CorsService: 'ICorsService',
    SettingsService: 'ISettingsService',
    DataService: 'IDataService',
    MonitorService: 'IMonitorService',
    StorageService: 'IStorageService',
    ErrorTemplateService: 'IErrorTemplateService',

    // Repositories
    UserRepository: 'IUserRepository',
    ApiKeysRepository: 'IApiKeysRepository',
    SettingsRepository: 'ISettingsRepository',
    DataRepository: 'IDataRepository'
} as const;
