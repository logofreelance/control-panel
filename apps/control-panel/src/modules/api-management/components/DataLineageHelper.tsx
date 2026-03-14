'use client';

import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useDataSourceColumns } from '../composables/useDataSourceColumns';

const L = MODULE_LABELS.apiManagement;

interface DataLineageHelperProps {
    dataSourceId?: number;
    onInsert: (variable: string) => void;
}

export const DataLineageHelper = ({ dataSourceId, onInsert }: DataLineageHelperProps) => {
    const { columns, loading } = useDataSourceColumns(dataSourceId);

    const standardVars = [
        { name: '{{DATA}}', desc: 'Full Result Array' },
        { name: '{{COUNT}}', desc: 'Total Records' },
        { name: '{{USER_ID}}', desc: 'Current User ID' },
        { name: '{{USER_ROLE}}', desc: 'Current User Role' },
    ];

    return (
        <div className="bg-slate-50/50 p-4 flex flex-col gap-6 h-full overflow-y-auto rounded-xl border border-slate-200/50">
            <div>
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Icons.zap className="w-3 h-3 text-amber-500" />
                    {L.misc?.standardVars}
                </h4>
                <div className="space-y-1">
                    {standardVars.map(v => (
                        <button
                            key={v.name}
                            onClick={() => onInsert(v.name)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                        >
                            <code className="text-xs font-bold text-slate-800 block">{v.name}</code>
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-500">{v.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Icons.database className="w-3 h-3 text-blue-500" />
                    {L.misc?.dataColumns}
                </h4>

                {!dataSourceId ? (
                    <p className="text-xs text-slate-400 italic">{L.misc?.selectDataSourceHint}</p>
                ) : loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-200 rounded animate-pulse" />)}
                    </div>
                ) : columns.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">{L.misc?.noColumnsFound}</p>
                ) : (
                    <div className="space-y-1">
                        {columns.map(col => (
                            <button
                                key={col.name}
                                onClick={() => onInsert(`{{item.${col.name}}}`)}
                                className="w-full text-left px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <code className="text-xs text-slate-700 font-medium truncate">{col.name}</code>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{col.type}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-auto bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                    <strong>{L.misc?.lineageTip}</strong> {L.misc?.lineageTipText} <code>{L.misc?.lineageTipCode}</code> {L.misc?.lineageTipSuffix}
                </p>
            </div>
        </div>
    );
};

