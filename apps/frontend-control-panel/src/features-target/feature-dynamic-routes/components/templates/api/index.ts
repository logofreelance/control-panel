// Forward exports to the new centralized API definition to preserve feature structure
import { DYNAMIC_ROUTES_API } from '../../../api';

export const API = { ...DYNAMIC_ROUTES_API.errorTemplates, global: DYNAMIC_ROUTES_API.errorTemplates.list };
