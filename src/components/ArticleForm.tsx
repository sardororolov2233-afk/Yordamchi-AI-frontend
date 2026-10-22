import React, { useRef, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { Language } from '../constants/templates';
import { showAlert } from '../utils/telegram';
import { CommerceAccount, getJobStatus, generateArticle, generateUUID } from '../api/client';
import { standardAllowance } from '../utils/commerce';

interface ArticleFormProps {
    isDark: boolean;
    account: CommerceAccount | null;
    onAccountRefresh?: () => void | Promise<void>;
    onOpenReferral?: () => void;
    balance?: number;
    isAdmin?: boolean;
    onJobStarted?: (jobId: string) => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ isDark, account, onJobStarted, onAccountRefresh, onOpenReferral }) => {
    const allowance = standardAllowance(account, 'article');
    const [topic, setTopic] = useState('');
    const [author, setAuthor] = useState('');
    const [language, setLanguage] = useState<Language>('uz');
    const [references, setReferences] = useState('');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const submittingRef = useRef(false);
    const requestIdsRef = useRef(new Map<string, string>());

    const handleGenerate = async () => {
        if (submittingRef.current || generating) return;
        if (!allowance.ready || !allowance.allowed) {
            showAlert(allowance.ready ? "Maqola uchun 1 kvota kerak. Do‘st taklif qilib kvota oling." : 'Hisob va bepul limit hali tekshirilmoqda. Birozdan so‘ng qayta urinib ko‘ring.');
            if (allowance.ready) onOpenReferral?.();
            return;
        }
        if (!topic.trim()) {
            showAlert('Maqola mavzusini kiriting!');
            return;
        }
        if (!author.trim()) {
            showAlert('Muallif ism-familiyasini kiriting!');
            return;
        }

        const submission = {
            topic: topic.trim(),
            author: author.trim(),
            language: (language as 'uz' | 'ru' | 'en') || 'uz',
            references: references.trim(),
        };
        const fingerprint = JSON.stringify(submission);
        let idempotencyKey = requestIdsRef.current.get(fingerprint);
        if (!idempotencyKey) {
            idempotencyKey = generateUUID();
            requestIdsRef.current.set(fingerprint, idempotencyKey);
        }
        submittingRef.current = true;
        setGenerating(true);
        try {
            const result = await generateArticle({
                ...submission,
                send_to_telegram: true,
                idempotencyKey,
            });

            if (onJobStarted) {
                onJobStarted(result.id);
            }

            showAlert("✅ Maqola generatsiyasi boshlandi! Ilmiy matn va annotatsiya tayyorlanmoqda. Tayyor DOCX fayli Telegram botingizga ham yuboriladi.");
        } catch (e: any) {
            // The server may have accepted the order before the connection was lost.
            // Recover by the same UUID instead of spending a second allowance.
            try {
                const existing = await getJobStatus(idempotencyKey);
                onJobStarted?.(existing.id);
                showAlert('Buyurtmangiz topildi. Holatini shu oynada kuzatishingiz mumkin.');
            } catch {
                showAlert(`Xatolik yuz berdi: ${e.message}`);
            }
        } finally {
            try {
                await onAccountRefresh?.();
            } finally {
                submittingRef.current = false;
                setGenerating(false);
            }
        }
    };

    const inputClasses = `w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
    }`;

    return (
        <div className="flex-1 flex flex-col justify-between h-full relative">
            <div className="px-5 pt-4 pb-5 flex flex-col gap-4 overflow-y-auto">
                {/* Header Info Card */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
                    isDark 
                        ? 'bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 border-cyan-500/30' 
                        : 'bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/80 border-cyan-200 shadow-slate-200/50'
                }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0 text-base">
                            <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-bold truncate">
                                    Ilmiy Maqola (DOCX)
                                </h3>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                    Claude Haiku
                                </span>
                            </div>
                            <p className="text-[10px] opacity-65 truncate">
                                Ilmiy matn • Annotatsiya • Word hujjati
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2.5 border-l border-slate-700/20">
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 block">
                            Xizmat narxi
                        </span>
                        <span className="text-xs sm:text-sm font-black text-emerald-400">
                            {allowance.label}
                        </span>
                    </div>
                </div>

                <div className={`rounded-xl border p-3 text-[11px] leading-relaxed ${isDark ? 'border-cyan-500/25 bg-cyan-950/15 text-slate-300' : 'border-cyan-200 bg-cyan-50 text-slate-600'}`} role="status">
                    <p>{allowance.note}</p>
                    <p className="mt-1">Referat, maqola va obyektivka bitta umumiy 3 talik bepul limitdan foydalanadi. Keyingi har bir buyurtma — 1 kvota.</p>
                    {allowance.ready && !allowance.allowed && onOpenReferral && <button type="button" onClick={onOpenReferral} className="mt-2 font-bold text-cyan-400 underline">Do‘st taklif qilib kvota olish</button>}
                </div>
                {/* Topic Input */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 ml-1">
                        Maqola mavzusi
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Masalan: Raqamli iqtisodiyotda sun'iy intellektning o'rni..."
                        className={inputClasses}
                    />
                </div>

                {/* Author Input */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 ml-1">
                        Muallif ism familiyasi
                    </label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="F.I.SH kiriting..."
                        className={inputClasses}
                    />
                </div>

                {/* Language Selection */}
                <div className="space-y-1.5 relative z-20">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 ml-1 block">
                        Kerakli til
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all flex items-center justify-between ${
                            isDark ? 'bg-slate-900 border-slate-700 text-slate-50' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">
                                {{ uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' }[language] || '🇺🇿'}
                            </span>
                            <span className="font-semibold">
                                {{ uz: "O'zbek", ru: 'Русский', en: 'English' }[language] || "O'zbek"}
                            </span>
                        </div>
                        <ChevronDown size={18} className={`transition-transform opacity-60 ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangOpen && (
                        <div className={`absolute top-full left-0 mt-2 w-full rounded-2xl border z-50 overflow-hidden shadow-2xl origin-top ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="max-h-48 overflow-y-auto w-full py-1">
                                {(['uz', 'ru', 'en'] as Language[]).map((lng) => {
                                    const flags: Record<Language, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
                                    const names: Record<Language, string> = { uz: "O'zbek", ru: 'Русский', en: 'English' };
                                    if (!flags[lng]) return null;
                                    return (
                                        <button
                                            key={lng}
                                            type="button"
                                            onClick={() => { setLanguage(lng); setIsLangOpen(false); }}
                                            className={`w-full px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                                                language === lng 
                                                  ? (isDark ? 'bg-slate-700/50 text-cyan-400 font-bold' : 'bg-slate-100 text-cyan-600 font-bold')
                                                  : (isDark ? 'text-slate-300 hover:bg-slate-700/30' : 'text-slate-700 hover:bg-slate-50')
                                            }`}
                                        >
                                            <span className="text-2xl drop-shadow-sm">{flags[lng]}</span>
                                            <span className={`${language === lng ? 'font-bold' : 'font-medium'}`}>{names[lng]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* References / Bibliography Input */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 ml-1">
                        Foydalanilgan adabiyotlar yoki manbalar (ixtiyoriy)
                    </label>
                    <textarea
                        rows={3}
                        value={references}
                        onChange={(e) => setReferences(e.target.value)}
                        placeholder="Agar maxsus kitob, qonun yoki maqolalardan foydalanish kerak bo'lsa, bu yerga yozing..."
                        className={`${inputClasses} resize-none`}
                    />
                </div>
            </div>

            {/* Bottom Button */}
            <div className="px-5 pb-5 mt-auto">
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || !allowance.ready || !allowance.allowed || !topic.trim() || !author.trim()}
                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)' }}
                >
                    {generating ? '⏳ YARATILMOQDA...' : !allowance.ready ? '⏳ LIMIT TEKSHIRILMOQDA...' : `✨ ILMIY MAQOLA YARATISH (${allowance.label})`}
                </button>
            </div>
        </div>
    );
};
