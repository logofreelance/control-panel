
import { SYSTEM_CORE_ROUTES } from '../src/features-target/feature-integration/constants';
import { IntegrationService } from '../src/features-target/feature-integration/services';

async function test() {
    console.log('--- SYSTEM_CORE_ROUTES ---');
    console.log('Count:', SYSTEM_CORE_ROUTES.length);
    console.log('First element:', SYSTEM_CORE_ROUTES[0]);

    // Test a merge mock
    const mockCoreRoutes = [{ endpoint: '/api/health/status', method: 'GET' }];
    const merged = [
              ...SYSTEM_CORE_ROUTES, 
              ...mockCoreRoutes.filter((cr: any) => !SYSTEM_CORE_ROUTES.some(sr => sr.route_path === (cr.route_path || cr.endpoint)))
    ];
    console.log('\n--- MERGED COUNT (with 1 duplicate mock) ---');
    console.log('Count:', merged.length);
}

test();
