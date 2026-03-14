import { Hono, Context } from 'hono';
import {
    DataSourceHonoHandlers,
    SchemaHonoHandlers,
    DataHonoHandlers,
    RelationHonoHandlers,
    ResourceHonoHandlers,
    ResolverHonoHandlers,
    DataSourceService,
    SchemaService,
    DataService,
    RelationService,
    ResourceService,
    ResolverService,
    MutationService
} from '@cp/datasource-manager';
import { API_PARAMS, getEnv, systemNotReady } from '@cp/config';
import { DrizzleDataSourceRepository } from '../../repositories/system-datasource/datasource';
import { DrizzleSchemaRepository } from '../../repositories/system-datasource/schema';
import { DrizzleDataRepository } from '../../repositories/system-datasource/data';
import { DrizzleRelationRepository } from '../../repositories/system-datasource/relation';
import { DrizzleResourceRepository } from '../../repositories/system-datasource/resource';
import { DrizzleResolverRepository } from '../../repositories/system-datasource/resolver';
import { DrizzleMutationRepository } from '../../repositories/system-datasource/mutation';

type Variables = {
    dsHandlers: DataSourceHonoHandlers;
    schemaHandlers: SchemaHonoHandlers;
    dataHandlers: DataHonoHandlers;
    relationHandlers: RelationHonoHandlers;
    resourceHandlers: ResourceHonoHandlers;
    resolverHandlers: ResolverHonoHandlers;
};

export const dataSourceRoutes = new Hono<{ Variables: Variables }>();

// Middleware to inject handlers
dataSourceRoutes.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env || !env.DATABASE_URL) return systemNotReady(c);

    // Instantiate Repositories
    const dsRepo = new DrizzleDataSourceRepository(env.DATABASE_URL);
    const schemaRepo = new DrizzleSchemaRepository(env.DATABASE_URL);
    const dataRepo = new DrizzleDataRepository(env.DATABASE_URL);
    const relationRepo = new DrizzleRelationRepository(env.DATABASE_URL);
    const resourceRepo = new DrizzleResourceRepository(env.DATABASE_URL);
    const resolverRepo = new DrizzleResolverRepository(env.DATABASE_URL);
    const mutationRepo = new DrizzleMutationRepository(env.DATABASE_URL);

    // Instantiate Services
    const dsService = new DataSourceService(dsRepo);
    const schemaService = new SchemaService(schemaRepo);
    const dataService = new DataService(dataRepo);
    const relationService = new RelationService(relationRepo);
    const resourceService = new ResourceService(resourceRepo);
    const mutationService = new MutationService(mutationRepo);
    const resolverService = new ResolverService(resolverRepo, mutationService);

    // Instantiate Handlers
    const dsHandlers = new DataSourceHonoHandlers(dsService);
    const schemaHandlers = new SchemaHonoHandlers(schemaService);
    const dataHandlers = new DataHonoHandlers(dataService);
    const relationHandlers = new RelationHonoHandlers(relationService);
    const resourceHandlers = new ResourceHonoHandlers(resourceService);
    const resolverHandlers = new ResolverHonoHandlers(resolverService);

    c.set('dsHandlers', dsHandlers);
    c.set('schemaHandlers', schemaHandlers);
    c.set('dataHandlers', dataHandlers);
    c.set('relationHandlers', relationHandlers);
    c.set('resourceHandlers', resourceHandlers);
    // c.set('resolverHandlers', resolverHandlers); // If needed for specific routes or export

    await next();
});

const getDS = (c: Context) => c.get('dsHandlers') as DataSourceHonoHandlers;
const getSchema = (c: Context) => c.get('schemaHandlers') as SchemaHonoHandlers;
const getData = (c: Context) => c.get('dataHandlers') as DataHonoHandlers;
const getRel = (c: Context) => c.get('relationHandlers') as RelationHonoHandlers;
const getRes = (c: Context) => c.get('resourceHandlers') as ResourceHonoHandlers;

// Data Sources
dataSourceRoutes.get('/', (c) => getDS(c).list(c));
dataSourceRoutes.get('/stats', (c) => getDS(c).stats(c));
dataSourceRoutes.post('/', (c) => getDS(c).create(c));
dataSourceRoutes.get(`/:${API_PARAMS.ID}`, (c) => getDS(c).get(c));
dataSourceRoutes.put(`/:${API_PARAMS.ID}`, (c) => getDS(c).update(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/archive`, (c) => getDS(c).archive(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/restore`, (c) => getDS(c).restore(c));
dataSourceRoutes.delete(`/:${API_PARAMS.ID}`, (c) => getDS(c).destroy(c));

// Schema / DDL
dataSourceRoutes.get(`/:${API_PARAMS.ID}/schema/columns`, (c) => getSchema(c).getColumns(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/schema/columns`, (c) => getSchema(c).addColumn(c));
dataSourceRoutes.put(`/:${API_PARAMS.ID}/schema/columns/:${API_PARAMS.COLUMN_NAME}`, (c) => getSchema(c).modifyColumn(c));
dataSourceRoutes.delete(`/:${API_PARAMS.ID}/schema/columns/:${API_PARAMS.COLUMN_NAME}`, (c) => getSchema(c).dropColumn(c));

// Data Management
dataSourceRoutes.post(`/:${API_PARAMS.ID}/data/import`, (c) => getData(c).bulkInsert(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/data/delete-bulk`, (c) => getData(c).bulkDelete(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/data`, (c) => getData(c).insert(c));
dataSourceRoutes.put(`/:${API_PARAMS.ID}/data/:rowId`, (c) => getData(c).update(c));
dataSourceRoutes.delete(`/:${API_PARAMS.ID}/data/:rowId`, (c) => getData(c).delete(c));

// Relations
dataSourceRoutes.get(`/:${API_PARAMS.ID}/relations`, (c) => getRel(c).list(c));
dataSourceRoutes.get(`/:${API_PARAMS.ID}/relations/targets`, (c) => getRel(c).targets(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/relations`, (c) => getRel(c).create(c));
dataSourceRoutes.put(`/:${API_PARAMS.ID}/relations/:relationName`, (c) => getRel(c).update(c));
dataSourceRoutes.delete(`/:${API_PARAMS.ID}/relations/:relationName`, (c) => getRel(c).delete(c));

// Resources
dataSourceRoutes.get(`/:${API_PARAMS.ID}/resources`, (c) => getRes(c).list(c));
dataSourceRoutes.post(`/:${API_PARAMS.ID}/resources`, (c) => getRes(c).create(c));
dataSourceRoutes.put(`/:${API_PARAMS.ID}/resources/:resourceId`, (c) => getRes(c).update(c));
dataSourceRoutes.delete(`/:${API_PARAMS.ID}/resources/:resourceId`, (c) => getRes(c).delete(c));

