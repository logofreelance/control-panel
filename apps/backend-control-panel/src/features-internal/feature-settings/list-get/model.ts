/**
 * list-get/model.ts
 */
export async function getSettings(db: any) {
    const res: any = await db.execute('SELECT setting_key, setting_value FROM panel_settings');
    const rows = Array.isArray(res) ? res : res.rows;
    return rows.reduce((acc: any, row: any) => {
        acc[row.setting_key] = row.setting_value;
        return acc;
    }, {});
}
