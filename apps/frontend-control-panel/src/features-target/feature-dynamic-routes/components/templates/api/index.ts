// Forward exports to the centralized API definition — uses isolated pageErrorTemplates endpoints
import { DYNAMIC_ROUTES_API } from '../../../api';

export const API = {
    global: DYNAMIC_ROUTES_API.pageErrorTemplates.list,
    save: DYNAMIC_ROUTES_API.pageErrorTemplates.save,
    delete: DYNAMIC_ROUTES_API.pageErrorTemplates.delete,
};
