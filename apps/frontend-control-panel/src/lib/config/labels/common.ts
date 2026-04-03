/**
 * packages/config/src/labels/common.ts
 * 
 * CENTRALIZED COMMON LABELS - Single Source of Truth
 * ALL UI text MUST come from here
 */

export const COMMON_LABELS = {
    // Common actions
    actions: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        add: 'Add',
        remove: 'Remove',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        confirm: 'Confirm',
        close: 'Close',
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        clone: 'Clone',
        archive: 'Archive',
        restore: 'Restore',
        view: 'View',
        update: 'Update',
        select: 'Select',
        clear: 'Clear',
        reset: 'Reset',
        apply: 'Apply',
        warning: 'Warning',
        goBack: 'Go Back',
        saveChanges: 'Save Changes',
        discardChanges: 'Discard Changes',
    },

    // Common table headers
    table: {
        id: 'ID',
        name: 'Name',
        description: 'Description',
        status: 'Status',
        type: 'Type',
        createdAt: 'Created',
        updatedAt: 'Updated',
        actions: 'Actions',
        noData: 'No data available',
        loading: 'Loading...',
        empty: 'No items found',
        selectAll: 'Select All',
        selected: '{count} selected',
    },

    // Common status labels
    status: {
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived',
        pending: 'Pending',
        draft: 'Draft',
        published: 'Published',
        enabled: 'Enabled',
        disabled: 'Disabled',
        public: 'Public',
        private: 'Private',
        loading: 'Loading...',
        initializing: 'Initializing...',
        unknown: 'Unknown',
        readyToLink: 'Ready to link',
    },

    // Form field labels
    fields: {
        name: 'Name',
        slug: 'Slug',
        description: 'Description',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        username: 'Username',
        newUsername: 'New Username',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        required: 'Required',
        optional: 'Optional',
    },

    // Validation messages
    validation: {
        required: '{field} is required',
        minLength: '{field} must be at least {min} characters',
        maxLength: '{field} must be at most {max} characters',
        email: 'Invalid email format',
        unique: '{field} already exists',
        invalid: 'Invalid {field}',
        noChanges: 'No changes detected',
        pattern: '{field} format is invalid',
        systemTableRestriction: "Not available for System Tables - use 'Belongs To'",
    },

    // Error pages
    errors: {
        somethingWentWrong: 'Something went wrong!',
        unexpectedError: 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
        goHome: 'Go Home',
        tryAgain: 'Try Again',
        errorId: 'Error ID',
    },

    // Common messages
    messages: {
        confirmDelete: 'Are you sure you want to delete this item?',
        confirmDeleteMultiple: 'Are you sure you want to delete {count} items?',
        unsavedChanges: 'You have unsaved changes. Continue anyway?',
        operationSuccess: 'Operation completed successfully',
        operationFailed: 'Operation failed. Please try again.',
        loadingData: 'Loading data...',
        savingData: 'Saving...',
        noResults: 'No results found',
        notFound: 'Not Found',
        notFoundDesc: 'The requested resource could not be found.',
    },

    // Pagination
    pagination: {
        page: 'Page',
        of: 'of',
        items: 'items',
        perPage: 'per page',
        first: 'First',
        last: 'Last',
        previous: 'Previous',
        next: 'Next',
        showing: 'Showing {from} to {to} of {total}',
    },

    // Auth related
    auth: {
        login: 'Login',
        logout: 'Sign Out',
        register: 'Register',
        username: 'Username',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        changePassword: 'Change Password',
        editUsername: 'Edit Username',
        adminCentral: 'Admin Central',
    },

    // Common UI elements
    ui: {
        menu: 'Menu',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Sign Out',
        dashboard: 'Dashboard',
        help: 'Help',
        notifications: 'Notifications',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
    },

    // Symbols
    symbol: {
        percent: '%',
        bullet: '•',
        equals: '=',
        asterisk: '*',
        parenthesisOpen: '(',
        parenthesisClose: ')',
    },

    // System status/checking labels
    system: {
        checkingStatus: 'Checking system status...',
        connectingBackend: 'Connecting to backend...',
        redirectingToSetup: 'Redirecting to setup...',
        retryConnection: 'Retry Connection',
        backendServerError: 'Cannot connect to backend server. Make sure the server is running on port 3001.',
    },

    // Not Found page
    notFound: {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist or has been moved.',
        backToHome: 'Back to Home',
    },

    // Error page (extends errors section)
    // Note: errors section already exists above

    // Login page
    login: {
        welcomeBack: 'Welcome Back',
        enterCredentials: 'Please enter your credentials to access the engine control center.',
        signInToEngine: 'Sign In to Engine',
        usernameExample: 'e.g. admin',
        passwordPlaceholder: '••••••••',
        failedToConnect: 'Failed to connect to server',
        authorizedOnly: 'Authorized access only. Join the millions of smart administrator who trust us to manage their engine.',
        noDatabaseFound: 'No Database Found',
        databaseError: 'Database Error',
        welcome: 'Welcome!',
        noAdminAccount: 'No admin account found. Redirecting to setup...',
        databaseUrlNotFound: 'DATABASE_URL not found in environment. Please configure your database connection.',
        unableToConnect: 'Unable to connect to database. Please check your DATABASE_URL and network connection.',
        addToEnv: '# Add to backend/.env',
        databaseUrlExample: 'DATABASE_URL=mysql://user:pass@host:port/db',
    },

    // Install/Setup page
    install: {
        // Step labels
        stepDatabase: 'Database',
        stepSetup: 'Setup',
        stepAdmin: 'Admin',

        // Checklist items
        validatingUrl: 'Validating URL format...',
        detectingProvider: 'Detecting provider...',
        connectingDatabase: 'Connecting to database...',
        creatingTables: 'Creating core tables...',
        verifyingSchema: 'Verifying schema...',
        initializingSettings: 'Initializing settings...',

        // Status messages
        setupComplete: 'Setup Complete!',
        goToDashboard: 'Go to Dashboard',
        databaseSetup: 'Database Setup',
        adminAccount: 'Admin Account',
        createAdminAccount: 'Create Admin Account',
        coreTablesCreated: 'Core tables created',

        // Form labels
        createUsername: 'Create your admin username',
        createPassword: 'Create a secure password',

        // Button labels
        createAdmin: 'Create Admin Account',
        skipToAdmin: 'Skip to Admin',
        processing: 'Processing...',

        // Provider names
        mysql: 'MySQL',
        tidbCloud: 'TiDB Cloud',
        planetscale: 'PlanetScale',
        postgres: 'PostgreSQL',
        neon: 'Neon',
        supabase: 'Supabase',
        sqlite: 'SQLite',

        // Debug info
        debugInfo: 'Debug Info',
        frontendEnv: 'Frontend Environment',
        apiUrl: 'API URL',
        nextPublicApiUrl: 'NEXT_PUBLIC_API_URL',
        targetEndpoint: 'Target Endpoint',
        fetchStatus: 'Fetch Status',
        backendStatus: 'Backend Status',
        databaseUrl: 'DATABASE_URL',
        configured: 'Configured',
        notSet: 'Not Set',
        cors: 'CORS',
        nodeEnv: 'NODE_ENV',
        dbError: 'DB Error',

        // Validation messages
        validFormat: 'Valid format detected',
        invalidUrl: 'Invalid database URL format',

        // Hints/Tips
        multipleStatementsHint: 'Parameter multipleStatements=true akan ditambahkan otomatis',

        // Success messages
        adminCreated: 'Admin account created! Redirecting...',
        allSetUp: "You're all set!",
        engineReady: 'Your Modular Engine is ready to use.',

        // Error messages
        apiNotConfigured: 'NEXT_PUBLIC_API_URL environment variable is not set. Please configure it in your deployment settings.',
        cannotConnect: 'Cannot connect to backend at',
        unknownError: 'Unknown network error',

        // Config check section
        configCheck: 'Configuration Check',
        checkingEnvAndDb: 'Checking environment variables and database connection',
        connectionError: 'Connection Error',
        networkError: 'Network Error',
        networkErrorHint: 'This usually means: 1) Backend not deployed, 2) Wrong API URL, or 3) CORS not configured',
        targetUrl: 'Target URL',
        systemStatusEndpoint: 'System Status Endpoint',
        setEnvHint: 'Set this in Cloudflare Pages → Settings → Environment Variables (Type: Text, NOT Secret)',
        set: 'Set',

        // Step 2/3 labels
        settingUpEngine: 'Setting Up Engine',
        pleaseWait: 'Please wait while we configure your system',
        createAdminBtn: 'Create Admin',
        setUpCredentials: 'Set up your master account credentials',
        databaseConnected: 'Database connected',
        completeSetup: 'Complete Setup',
        initializeDbTables: 'Initialize Database Tables',
        retryConnection: 'Retry Connection',
        envConfigNote: 'Database connection is configured via environment variables. Set NEXT_PUBLIC_API_URL in frontend and DATABASE_URL in backend.',

        // Completion screen
        allSet: 'All Set!',
        engineReadyToUse: 'Your Modular Engine is ready to use',
        tablesCreated: 'Core tables created',
        adminAccountReady: 'Admin account ready',
        redirectingToLogin: 'Redirecting to login...',

        // Password strength
        strongPassword: 'Strong password',
        goodPassword: 'Good password',
        weakPassword: 'Weak password',
        tooShort: 'Too short',

        // Form placeholders
        usernamePlaceholder: 'Username',
        passwordPlaceholder: 'Password',
        percentComplete: 'complete',

        // Connected/failed messages
        connectedToDatabase: 'Connected to database',
        connectionFailed: 'Connection failed',

        // Footer
        poweredBy: 'Powered by Modular Engine v1.0',
    },
} as const;

export type CommonLabels = typeof COMMON_LABELS;
