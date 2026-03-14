import { desc, eq, createDb, apiCategories, apiEndpoints } from '@modular/database';
import { IApiCategoriesRepository, CategoryData } from '@cp/api-manager';

export class DrizzleApiCategoriesRepository implements IApiCategoriesRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async findAll() {
        const categories = await this.db.select().from(apiCategories).orderBy(desc(apiCategories.createdAt));
        return categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined
        }));
    }

    async save(data: CategoryData) {
        if (data.id) {
            await this.db.update(apiCategories).set({
                name: data.name,
                description: data.description
            }).where(eq(apiCategories.id, data.id));
        } else {
            await this.db.insert(apiCategories).values({
                name: data.name,
                description: data.description
            });
        }
    }

    async delete(id: number) {
        await this.db.delete(apiCategories).where(eq(apiCategories.id, id));
    }

    async findById(id: number) {
        const [cat] = await this.db.select().from(apiCategories).where(eq(apiCategories.id, id)).limit(1);
        if (!cat) return null;
        return {
            id: cat.id,
            name: cat.name,
            description: cat.description || undefined
        };
    }

    async hasChildren(id: number) {
        // Check endpoints only (Categories are flat in this schema version)
        const [ep] = await this.db.select({ id: apiEndpoints.id })
            .from(apiEndpoints)
            .where(eq(apiEndpoints.categoryId, id))
            .limit(1);

        return !!ep;
    }
}
