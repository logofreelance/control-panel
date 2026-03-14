import { REGEX_PATTERNS, CHARS, SYSTEM_DEFAULTS, SQL } from '../config/constants';
import { LABELS } from '../config/labels';
import { ResourceDefinition } from '../types';
import { IResourceRepository } from '../types/repository';

const MSG = LABELS;

export class ResourceService {
    constructor(private repo: IResourceRepository) { }

    private async getSource(id: number) {
        try {
            return await this.repo.getSource(id);
        } catch {
            throw new Error(MSG.ERROR.NOT_FOUND);
        }
    }

    async list(id: number) {
        return this.repo.list(id);
    }

    async create(id: number, data: ResourceDefinition) {
        await this.getSource(id);

        const slug = data.slug || data.name.toLowerCase().replace(REGEX_PATTERNS.SLUG, CHARS.HYPHEN);

        const insertId = await this.repo.create({
            dataSourceId: id,
            name: data.name,
            slug,
            description: data.description || null,
            fieldsJson: (data.fields && Object.keys(data.fields).length > 0) ? JSON.stringify(data.fields) : null,
            filtersJson: (data.filters && data.filters.length > 0) ? JSON.stringify(data.filters) : null,
            relationsJson: (data.relations && data.relations.length > 0) ? JSON.stringify(data.relations) : null,
            aggregatesJson: (data.aggregates && data.aggregates.length > 0) ? JSON.stringify(data.aggregates) : null,
            computedFieldsJson: (data.computed && data.computed.length > 0) ? JSON.stringify(data.computed) : null,
            joinsJson: (data.joins && data.joins.length > 0) ? JSON.stringify(data.joins) : null,
            orderBy: data.orderBy || null,
            orderDirection: (data.orderDirection as 'ASC' | 'DESC') || SQL.DESC,
            defaultLimit: Number(data.defaultLimit) || SYSTEM_DEFAULTS.DEFAULT_LIMIT,
            maxLimit: Number(data.maxLimit) || SYSTEM_DEFAULTS.MAX_LIMIT,
            isPublic: data.isPublic ? true : false,
            requiredRoles: data.requiredRoles || null,
            requiredPermissions: data.requiredPermissions || null
        });

        const newResource = await this.repo.findById(insertId);

        return { message: MSG.SUCCESS.RESOURCE_CREATED, data: newResource };
    }

    async update(rid: number, data: ResourceDefinition) {
        await this.repo.update(rid, {
            name: data.name,
            description: data.description || null,
            fieldsJson: (data.fields && Object.keys(data.fields).length > 0) ? JSON.stringify(data.fields) : null,
            filtersJson: (data.filters && data.filters.length > 0) ? JSON.stringify(data.filters) : null,
            relationsJson: (data.relations && data.relations.length > 0) ? JSON.stringify(data.relations) : null,
            aggregatesJson: (data.aggregates && data.aggregates.length > 0) ? JSON.stringify(data.aggregates) : null,
            computedFieldsJson: (data.computed && data.computed.length > 0) ? JSON.stringify(data.computed) : null,
            joinsJson: (data.joins && data.joins.length > 0) ? JSON.stringify(data.joins) : null,
            orderBy: data.orderBy || null,
            orderDirection: (data.orderDirection as 'ASC' | 'DESC') || SQL.DESC,
            defaultLimit: Number(data.defaultLimit) || SYSTEM_DEFAULTS.DEFAULT_LIMIT,
            maxLimit: Number(data.maxLimit) || SYSTEM_DEFAULTS.MAX_LIMIT,
            isPublic: data.isPublic ? true : false,
            requiredRoles: data.requiredRoles || null,
            requiredPermissions: data.requiredPermissions || null,
            updatedAt: new Date()
        });

        const updatedResource = await this.repo.findById(rid);

        return { message: MSG.SUCCESS.RESOURCE_UPDATED, data: updatedResource };
    }

    async delete(rid: number) {
        await this.repo.delete(rid);
        return { message: MSG.SUCCESS.RESOURCE_DELETED };
    }
}
