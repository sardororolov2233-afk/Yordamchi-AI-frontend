import React from 'react';
import { Language } from '../constants/templates';
import { translations } from '../constants/translations';
import { TemplateSelector } from './TemplateSelector';

interface PresentationFormProps {
    language: Language;
    isDark: boolean;
    topic: string;
    setTopic: (v: string) => void;
    author: string;
    setAuthor: (v: string) => void;
    slideCount: number;
    setSlideCount: (v: number) => void;
    balance: number;
    selectedTemplate: number;
    setSelectedTemplate: (id: number) => void;
    imageMode: 'ai' | 'manual';
    setImageMode: (m: 'ai' | 'manual') => void;
    imageNames: string[];
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PresentationForm: React.FC<PresentationFormProps> = ({
    language,
    isDark,
    topic,
    setTopic,
    author,
    setAuthor,
    slideCount,
    setSlideCount,
    balance,
    selectedTemplate,
    setSelectedTemplate,
    imageMode,
    setImageMode,
    imageNames,
    handleImageChange,
}) => {
    const t = translations[language];
    const inp = isDark
        ? 'bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

    return (
        <div className="px-5 pt-2 pb-5 flex-1 flex flex-col gap-4">
            {/* Topic */}
            <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {t.topicLabel}
                </label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={`w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/70 ${inp}`}
                />
            </div>

            {/* Author */}
            <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {t.authorLabel}
                </label>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/70 ${inp}`}
                />
            </div>

            {/* Slide count */}
            <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {t.slideCountLabel}
                </label>
                <input
                    type="number"
                    min={3}
                    max={20}
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/70 ${inp}`}
                />
                <div className="flex justify-between items-center text-[10px]">
                    <span className="opacity-70">3–20 slayd orasida</span>
                    <span className={`font-bold ${balance < slideCount * 300 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {t.priceLabel}: {(slideCount * 300).toLocaleString()} {t.currency}
                    </span>
                </div>
            </div>

            {/* Template selector */}
            <TemplateSelector
                language={language}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                isDark={isDark}
            />

            {/* Image Mode */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {t.imageLabel}
                </label>
                <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setImageMode('ai')}
                            className={`w-full px-3 py-2 rounded-2xl text-xs font-semibold border text-left transition-colors ${imageMode === 'ai'
                                ? isDark
                                    ? 'bg-slate-200 text-slate-900 border-slate-300'
                                    : 'bg-slate-900 text-slate-50 border-slate-800'
                                : isDark
                                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                                    : 'bg-slate-50 border-slate-300 text-slate-700'
                                }`}
                        >
                            {t.imageModeAI}
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageMode('manual')}
                            className={`w-full px-3 py-2 rounded-2xl text-xs font-semibold border text-left transition-colors ${imageMode === 'manual'
                                ? isDark
                                    ? 'bg-indigo-500 text-white border-indigo-400'
                                    : 'bg-indigo-600 text-white border-indigo-500'
                                : isDark
                                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                                    : 'bg-slate-50 border-slate-300 text-slate-700'
                                }`}
                        >
                            {t.imageModeManual}
                        </button>
                    </div>
                    {imageMode === 'manual' && (
                        <div className="flex items-center gap-2">
                            <label
                                className={`px-3 py-2 rounded-2xl text-xs font-semibold border cursor-pointer inline-flex items-center gap-2 ${isDark
                                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                                    : 'bg-slate-50 border-slate-300 text-slate-800'
                                    }`}
                            >
                                <span>Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                            <span className="text-[11px] opacity-70 line-clamp-1">
                                {imageNames.length === 0
                                    ? t.imagePlaceholder
                                    : imageNames.length === 1
                                        ? imageNames[0]
                                        : `${imageNames[0]} + ${imageNames.length - 1} ...`}
                            </span>
                        </div>
                    )}
                    <div
                        className={`text-[10px] rounded-2xl px-3 py-2 border ${isDark
                            ? 'bg-yellow-900/40 border-yellow-500/60 text-yellow-200'
                            : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                            }`}
                    >
                        {t.aiWarning}
                    </div>
                </div>
            </div>
        </div>
    );
};
