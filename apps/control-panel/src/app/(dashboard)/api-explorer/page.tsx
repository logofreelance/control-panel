import { buildPageTitle } from '@cp/config';
import { ApiExplorerView } from '@/modules/api-explorer';

export const metadata = {
    title: buildPageTitle('API Explorer')
};

export default function ApiExplorerPage() {
    return <ApiExplorerView />;
}
