/**
 * widget-stats-summary-get/model.ts
 */

export async function getStatsSummary(db: any) {
  const [sourcesRes, categoriesRes, trashRes]: any = await Promise.all([
    db.execute(`SELECT COUNT(*) as count FROM database_tables WHERE is_archived = 0`),
    db.execute(`SELECT COUNT(*) as count FROM database_categories`),
    db.execute(`SELECT COUNT(*) as count FROM database_tables WHERE is_archived = 1`)
  ]);

  const activeSources = Array.isArray(sourcesRes) && sourcesRes.length > 0 ? Number(sourcesRes[0].count) : 
                        (sourcesRes.rows && sourcesRes.rows.length > 0 ? Number(sourcesRes.rows[0].count) : 0);
                        
  const totalCategories = Array.isArray(categoriesRes) && categoriesRes.length > 0 ? Number(categoriesRes[0].count) : 
                          (categoriesRes.rows && categoriesRes.rows.length > 0 ? Number(categoriesRes.rows[0].count) : 0);
                          
  const trashedSources = Array.isArray(trashRes) && trashRes.length > 0 ? Number(trashRes[0].count) : 
                         (trashRes.rows && trashRes.rows.length > 0 ? Number(trashRes.rows[0].count) : 0);

  // Hardcode for now, ideally we should COUNT sum of physical rows
  const totalRecords = 0; 
  const totalStorageBytes = 0;

  return {
    activeSources,
    totalRecords,
    totalStorageBytes,
    totalCategories,
    trashedSources
  };
}
