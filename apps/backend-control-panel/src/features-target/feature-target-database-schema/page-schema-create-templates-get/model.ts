/**
 * page-schema-create-templates-get/model.ts
 */

export function getTemplates() {
  return [
    {
      id: 'blog',
      name: 'Blog Post',
      icon: '📝',
      description: 'Standard blog post schema with title, content, slug, and status.',
      schema: {
        columns: [
          { name: 'title', type: 'string', required: true },
          { name: 'slug', type: 'slug', unique: true, target: 'title' },
          { name: 'content', type: 'text' },
          { name: 'status', type: 'status', values: ['draft', 'published'] },
          { name: 'published_at', type: 'datetime' }
        ],
        timestamps: true
      }
    },
    {
      id: 'products',
      name: 'Product Catalog',
      icon: '🛍️',
      description: 'E-commerce product definition with price, SKU, and inventory.',
      schema: {
        columns: [
          { name: 'name', type: 'string', required: true },
          { name: 'sku', type: 'string', unique: true },
          { name: 'price', type: 'decimal', required: true },
          { name: 'stock', type: 'integer', default: '0' },
          { name: 'category', type: 'string' }
        ],
        timestamps: true
      }
    },
    {
      id: 'users',
      name: 'User Profile',
      icon: '👤',
      description: 'Extended user profile information linked to system users.',
      schema: {
        columns: [
          { name: 'user_id', type: 'integer', unique: true, required: true },
          { name: 'full_name', type: 'string' },
          { name: 'bio', type: 'text' },
          { name: 'avatar_url', type: 'string' },
          { name: 'phone', type: 'string' }
        ],
        timestamps: true
      }
    },
    {
      id: 'tasks',
      name: 'Task Tracker',
      icon: '✅',
      description: 'Simple project management tasks with priority and due dates.',
      schema: {
        columns: [
          { name: 'title', type: 'string', required: true },
          { name: 'priority', type: 'status', values: ['low', 'medium', 'high'] },
          { name: 'is_completed', type: 'boolean', default: 'false' },
          { name: 'due_date', type: 'date' }
        ],
        timestamps: true
      }
    }
  ];
}
