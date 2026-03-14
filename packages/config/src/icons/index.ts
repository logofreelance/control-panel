/**
 * @cp/config - Icons Registry
 * 
 * Centralized icon management using Lucide React.
 * ALL icons must be Lucide components - NO EMOJI allowed.
 * 
 * Usage:
 * import { Icons, MenuIcons, StatusIcons } from '@cp/config';
 * 
 * <Icons.home className="w-5 h-5" />
 * <MenuIcons.dashboard.Icon className="w-5 h-5" />
 * 
 * 🤖 AI INSTRUCTIONS:
 * - Use Icons.xxx for all icon needs
 * - NEVER use emoji icons - ESLint will ERROR
 * - If icon doesn't exist, ADD it here first
 */

import {
    // Navigation
    Home,
    ArrowLeft,
    ArrowRight,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,

    // Actions
    Plus,
    Pencil,
    Trash2,
    Save,
    RefreshCw,
    Search,
    Filter,
    Copy,
    MoreHorizontal,
    ExternalLink,

    // Status
    Check,
    Circle,
    CheckCircle,
    XCircle,
    AlertTriangle,
    AlertCircle,
    Info,
    Loader2,
    Clock,
    Timer,

    // Communication
    Bell,
    MessageSquare,
    Mail,
    Send,
    Phone,

    // Data
    Folder,
    FolderOpen,
    File,
    FileText,
    Database,
    Cloud,
    Upload,
    Download,
    HardDrive,
    Table,
    Package,
    List,
    Hash,
    Fingerprint,

    // Security
    Lock,
    Unlock,
    Key,
    Shield,
    ShieldCheck,

    // User
    User,
    Users,
    UserPlus,
    UserCog,
    Crown,

    // Settings
    Settings,
    Wrench,
    Cog,
    SlidersHorizontal,

    // API & Routes
    Rocket,
    Zap,
    Link,
    Link2Off,
    Globe,
    Network,
    Route,
    Code,
    Braces,
    Terminal,
    Play,
    TestTube2,
    FlaskConical,

    // Analytics
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    Activity,
    Eye,

    // Finance
    DollarSign,
    CreditCard,

    // Other
    Star,
    Heart,
    Pin,
    Calendar,
    Tag,
    Camera,
    Image,
    Lightbulb,
    LogOut,
    LogIn,
    Power,
    PowerOff,
    ToggleLeft,
    ToggleRight,
    Sparkles,
    BookOpen,
    ClipboardList,
    Radio,
    Paperclip,
    CircleDot,
    Gem,
    Smartphone,
    Server,

    GitBranch,

    // Types
    type LucideIcon,
} from 'lucide-react';

// Re-export LucideIcon type
export type { LucideIcon };

// ============================================
// GENERAL PURPOSE ICONS
// ============================================
export const Icons = {
    // Navigation
    home: Home,
    back: ArrowLeft,
    forward: ArrowRight,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    menu: Menu,
    close: X,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronUp: ChevronUp,
    chevronDown: ChevronDown,

    // Actions
    add: Plus,
    plus: Plus,
    edit: Pencil,
    pencil: Pencil,
    delete: Trash2,
    trash: Trash2,
    save: Save,
    refresh: RefreshCw,
    search: Search,
    filter: Filter,
    copy: Copy,
    more: MoreHorizontal,
    external: ExternalLink,

    // Status
    check: Check,
    circle: Circle,
    success: CheckCircle,
    checkCircle: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    alert: AlertCircle,
    info: Info,
    loading: Loader2,
    clock: Clock,
    timer: Timer,

    // Communication
    notification: Bell,
    bell: Bell,
    message: MessageSquare,
    email: Mail,
    mail: Mail,
    send: Send,
    phone: Phone,

    // Data
    folder: Folder,
    folderOpen: FolderOpen,
    file: File,
    fileText: FileText,
    text: FileText,
    document: FileText,
    database: Database,
    cloud: Cloud,
    upload: Upload,
    download: Download,
    storage: HardDrive,
    hardDrive: HardDrive,
    table: Table,
    package: Package,
    json: Braces,
    list: List,
    hash: Hash,
    number: Hash,
    uuid: Fingerprint,

    // Security
    lock: Lock,
    unlock: Unlock,
    key: Key,
    shield: Shield,
    shieldCheck: ShieldCheck,
    permissions: Shield,

    // User
    user: User,
    users: Users,
    userPlus: UserPlus,
    userCog: UserCog,
    admin: Crown,
    crown: Crown,

    // Settings
    settings: Settings,
    config: Wrench,
    wrench: Wrench,
    cog: Cog,
    sliders: SlidersHorizontal,

    // API & Routes
    rocket: Rocket,
    lightning: Zap,
    zap: Zap,
    link: Link,
    linkOff: Link2Off,
    globe: Globe,
    url: Globe,
    network: Network,
    routes: Route,
    route: Route,
    code: Code,
    braces: Braces,
    terminal: Terminal,
    play: Play,
    test: TestTube2,
    flask: FlaskConical,
    api: Key,

    // Analytics
    chart: BarChart3,
    barChart: BarChart3,
    lineChart: LineChart,
    pieChart: PieChart,
    trending: TrendingUp,
    activity: Activity,
    monitor: Activity,
    stats: BarChart3,
    eye: Eye,

    // Finance
    dollar: DollarSign,
    money: DollarSign,
    credit: CreditCard,

    // Other
    star: Star,
    heart: Heart,
    pin: Pin,
    calendar: Calendar,
    date: Calendar,
    tag: Tag,
    camera: Camera,
    image: Image,
    tip: Lightbulb,
    lightbulb: Lightbulb,
    signOut: LogOut,
    logout: LogOut,
    signIn: LogIn,
    login: LogIn,
    power: Power,
    toggleOff: ToggleLeft,
    toggleOn: ToggleRight,
    boolean: ToggleLeft,
    sparkles: Sparkles,
    bookOpen: BookOpen,
    clipboardList: ClipboardList,
    radio: Radio,
    paperclip: Paperclip,
    attachment: Paperclip,
    status: CircleDot,
    gem: Gem,
    diamond: Gem,
    server: Server,
    // Aliases for consistency
    trash2: Trash2,
    alertTriangle: AlertTriangle,
    smartphone: Smartphone,
    branch: GitBranch,
    gitBranch: GitBranch,
    powerOff: PowerOff,
    link2: Link,
} as const;

// ============================================
// MENU ICONS - For sidebar/navigation
// Lucide Only - NO EMOJI!
// ============================================
export const MenuIcons = {
    dashboard: {
        id: 'dashboard',
        label: 'Dashboard',
        Icon: Home,
        href: '/'
    },
    apiManagement: {
        id: 'api-management',
        label: 'API Management',
        Icon: Rocket,
        href: '/api-management'
    },
    apiExplorer: {
        id: 'api-explorer',
        label: 'API Explorer',
        Icon: BookOpen,
        href: '/api-explorer'
    },
    apiTester: {
        id: 'api-tester',
        label: 'API Tester',
        Icon: FlaskConical,
        href: '/api-tester'
    },
    authRoutes: {
        id: 'auth-routes',
        label: 'Auth Routes',
        Icon: Shield,
        href: '/auth-routes'
    },
    dataSources: {
        id: 'datasources',
        label: 'Data Sources',
        Icon: Database,
        href: '/data-sources'
    },
    errorTemplates: {
        id: 'error-templates',
        label: 'Error Templates',
        Icon: AlertTriangle,
        href: '/error-templates'
    },
    api: {
        id: 'api',
        label: 'API & CORS',
        Icon: Key,
        href: '/api'
    },
    users: {
        id: 'users',
        label: 'Users',
        Icon: Users,
        href: '/users'
    },
    roles: {
        id: 'roles',
        label: 'Roles',
        Icon: ShieldCheck,
        href: '/roles'
    },
    permissions: {
        id: 'permissions',
        label: 'Permissions',
        Icon: Lock,
        href: '/permissions'
    },
    storage: {
        id: 'storage',
        label: 'Storage Analytics',
        Icon: HardDrive,
        href: '/storage'
    },
    monitor: {
        id: 'monitor',
        label: 'API Monitor',
        Icon: Activity,
        href: '/monitor'
    },
    settings: {
        id: 'settings',
        label: 'Settings',
        Icon: Settings,
        href: '/settings'
    }
} as const;

// Helper to get menu items as array
export const getMenuItems = () => Object.values(MenuIcons);

// ============================================
// STATUS ICONS - For status indicators
// ============================================
export const StatusIcons = {
    active: CheckCircle,
    inactive: XCircle,
    pending: Clock,
    online: CheckCircle,
    offline: XCircle,
    syncing: RefreshCw,
} as const;

// ============================================
// HTTP METHOD STYLES
// ============================================
export const HttpMethodStyles = {
    GET: { color: 'bg-blue-100 text-blue-700', Icon: Download },
    POST: { color: 'bg-green-100 text-green-700', Icon: Upload },
    PUT: { color: 'bg-amber-100 text-amber-700', Icon: Pencil },
    PATCH: { color: 'bg-orange-100 text-orange-700', Icon: Wrench },
    DELETE: { color: 'bg-red-100 text-red-700', Icon: Trash2 },
} as const;

// ============================================
// DATA TYPE ICONS - For schema/column types
// ============================================
export const DataTypeIcons = {
    id: Key,
    uuid: Fingerprint,
    string: FileText,
    text: FileText,
    slug: Link,
    number: Hash,
    integer: Hash,
    bigint: Hash,
    float: BarChart3,
    decimal: DollarSign,
    boolean: ToggleLeft,
    date: Calendar,
    datetime: Clock,
    timestamp: Timer,
    json: Braces,
    array: Braces,
    enum: List,
    status: CircleDot,
    email: Mail,
    phone: Phone,
    url: Globe,
    file: File,
    image: Image,
    relation: Link,
} as const;

// ============================================
// TOAST ICONS - For notifications
// ============================================
export const ToastIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type IconKey = keyof typeof Icons;
export type MenuIconKey = keyof typeof MenuIcons;
export type StatusIconKey = keyof typeof StatusIcons;
export type HttpMethod = keyof typeof HttpMethodStyles;
export type DataType = keyof typeof DataTypeIcons;
export type ToastIconType = keyof typeof ToastIcons;
