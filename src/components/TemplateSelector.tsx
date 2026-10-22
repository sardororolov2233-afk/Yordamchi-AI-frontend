import React from 'react';
import { DESIGN_TEMPLATES, Language } from '../constants/templates';
import { translations } from '../constants/translations';

interface TemplateSelectorProps {
    language: Language;
    selectedTemplate: number;
    setSelectedTemplate: (id: number) => void;
    isDark: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    language,
    selectedTemplate,
    setSelectedTemplate,
    isDark,
}) => {
    const t = translations[language];

    return (
        <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                {t.designLabel}
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
                {DESIGN_TEMPLATES.map((tmpl) => (
                    <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`flex-shrink-0 w-[100px] rounded-2xl border-2 transition-all duration-200 overflow-hidden ${selectedTemplate === tmpl.id
                                ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                                : isDark
                                    ? 'border-slate-700 hover:border-slate-500'
                                    : 'border-slate-200 hover:border-slate-400'
                            }`}
                    >
                        {/* Color/Image preview */}
                        <div className="h-[60px] relative overflow-hidden rounded-t-xl">
                            {tmpl.preview ? (
                                <img src={tmpl.preview} alt={tmpl.name} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="absolute inset-0" style={{ background: tmpl.colors[0] }}></div>
                                    <div
                                        className="absolute bottom-0 right-0 w-[60%] h-[70%] rounded-tl-2xl"
                                        style={{ background: tmpl.colors[1] }}
                                    ></div>
                                    <div
                                        className="absolute top-2 left-2 w-5 h-5 rounded-full"
                                        style={{ background: tmpl.colors[2] }}
                                    ></div>
                                    <div
                                        className="absolute bottom-2 right-2 w-3 h-3 rounded-sm"
                                        style={{ background: tmpl.colors[3] }}
                                    ></div>
                                </>
                            )}
                            {selectedTemplate === tmpl.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="text-white text-lg">✓</span>
                                </div>
                            )}
                        </div>
                        {/* Name */}
                        <div
                            className={`px-2 py-1.5 text-[9px] font-semibold text-center leading-tight ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'
                                }`}
                        >
                            {tmpl.name}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
