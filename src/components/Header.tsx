import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Gift } from 'lucide-react';
import { Language } from '../constants/templates';
import { translations } from '../constants/translations';
import { updateMyProfile } from '../api/client';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    isDark: boolean;
    setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
    balance: number;
    referralCredits?: number;
    onOpenReferral?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    language,
    setLanguage,
    isDark,
    setIsDark,
    referralCredits = 0,
    onOpenReferral,
}) => {
    const t = translations[language];
    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Styles computed based on theme
    const pill = isDark
        ? 'bg-slate-900/90 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
        : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:border-cyan-300 shadow-sm';

    return (
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-col">
                <span className="text-[11px] font-semibold tracking-wide uppercase opacity-60">Orzu AI</span>
                <span className="text-sm font-bold">{t.title}</span>
            </div>
            <div className="flex items-center gap-2">
                {/* Quota Badge with Referral click */}
                <button
                    type="button"
                    onClick={onOpenReferral}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 ${pill}`}
                    title="Do‘stlarni taklif qilish va kvota olish"
                >
                    <Gift size={13} className="text-cyan-400" />
                    <span>{referralCredits} kvota</span>
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] ml-0.5">
                        <Plus size={10} />
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setIsDark((p) => !p)}
                    className="w-8 h-8 rounded-full border border-slate-400/40 flex items-center justify-center text-[11px] font-semibold bg-slate-100/40 hover:bg-slate-200/60 transition-colors"
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className={`h-8 px-3 rounded-full border border-slate-400/40 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                            isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100/40 hover:bg-slate-200/60'
                        }`}
                    >
                        <span>{t.langNames[language]}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangOpen && (
                        <div className={`absolute top-full right-0 mt-2 max-h-64 overflow-y-auto w-20 rounded-xl border py-1.5 z-50 shadow-2xl ${isDark ? 'bg-[#121827] border-cyan-800/40' : 'bg-white border-slate-200'}`}>
                            {(Object.keys(translations) as Language[]).map((lng) => (
                                <button
                                    key={lng}
                                    type="button"
                                    onClick={() => {
                                        setLanguage(lng);
                                        setIsLangOpen(false);
                                        updateMyProfile({ language_code: lng }).catch(() => {});
                                    }}
                                    className={`w-full px-3 py-2 text-left text-[11px] font-semibold transition-colors flex items-center justify-between ${
                                        language === lng
                                            ? (isDark ? 'bg-cyan-900/40 text-cyan-400' : 'bg-slate-100 text-indigo-600')
                                            : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                                    }`}
                                >
                                    {t.langNames[lng]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
