/**
 * page-error-templates-delete-delete/model.ts
 */
export async function deleteErrorTemplate(db: any, id: string) {
  await db.execute('DELETE FROM api_error_templates WHERE id = ?', [id]);
}
