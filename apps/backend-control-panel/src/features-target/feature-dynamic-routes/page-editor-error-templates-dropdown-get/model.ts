/**
 * page-editor-error-templates-dropdown-get/model.ts
 */
export async function getAllErrorTemplates(db: any) {
  const res: any = await db.execute('SELECT * FROM api_error_templates ORDER BY created_at DESC');
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
