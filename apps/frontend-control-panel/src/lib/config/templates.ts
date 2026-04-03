
export interface DataSourceTemplate {
    id: string;
    name: string;
    description: string;
    category: 'ecommerce' | 'content' | 'crm' | 'general';
    icon: string;
    schema: any; // using any to avoid type complexity in config for now
}

export const TEMPLATES: DataSourceTemplate[] = [
    {
        id: 'products',
        name: 'Products',
        description: 'Standard product catalog with price, stock, and images.',
        category: 'ecommerce',
        icon: '🛒',
        schema: {
            columns: [
                { name: 'name', type: 'string', required: true },
                { name: 'slug', type: 'slug', unique: true },
                { name: 'description', type: 'text' },
                { name: 'price', type: 'decimal' },
                { name: 'stock', type: 'integer', default: 0 },
                { name: 'sku', type: 'string', unique: true },
                { name: 'image', type: 'image' },
                { name: 'is_active', type: 'boolean', default: 'true' }
            ],
            timestamps: true
        }
    },
    {
        id: 'blog-posts',
        name: 'Blog Posts',
        description: 'Content management for articles and news.',
        category: 'content',
        icon: '📝',
        schema: {
            columns: [
                { name: 'title', type: 'string', required: true },
                { name: 'slug', type: 'slug', unique: true },
                { name: 'content', type: 'text' },
                { name: 'excerpt', type: 'string' },
                { name: 'featured_image', type: 'image' },
                { name: 'published_at', type: 'datetime' },
                { name: 'status', type: 'status' }
            ],
            timestamps: true
        }
    },
    {
        id: 'contacts',
        name: 'Contacts',
        description: 'CRM style contact list with email and phone.',
        category: 'crm',
        icon: '👥',
        schema: {
            columns: [
                { name: 'full_name', type: 'string', required: true },
                { name: 'email', type: 'email', unique: true },
                { name: 'phone', type: 'phone' },
                { name: 'company', type: 'string' },
                { name: 'notes', type: 'text' },
                { name: 'tags', type: 'json' }
            ],
            timestamps: true
        }
    },
    {
        id: 'events',
        name: 'Events',
        description: 'Calendar events with start/end times.',
        category: 'general',
        icon: '📅',
        schema: {
            columns: [
                { name: 'title', type: 'string', required: true },
                { name: 'description', type: 'text' },
                { name: 'start_time', type: 'datetime', required: true },
                { name: 'end_time', type: 'datetime', required: true },
                { name: 'location', type: 'string' },
                { name: 'capacity', type: 'integer' }
            ],
            timestamps: true
        }
    }
];
