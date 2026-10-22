import React, { useState, useEffect, useCallback } from 'react';
import { generateDesign } from '../api/client';
import { showAlert } from '../utils/telegram';

// ── Types ───────────────────────────────────────────────────
export type BannerFormat = 'instagram' | 'telegram' | 'story';
export type DesignStyle = 'infographic' | 'photorealistic' | '3d' | 'minimalism';
type DesignScreen = 'form' | 'loading' | 'gallery' | 'preview';

export interface DesignFormData {
    description: string;
    format: BannerFormat;
    style: DesignStyle;
}

interface DesignFormProps {
    isDark: boolean;
    balance?: number;
    referralCredits?: number;
    isAdmin?: boolean;
    onOpenReferral?: () => void;
}

// ── Constants ───────────────────────────────────────────────
const FORMAT_OPTIONS: { id: BannerFormat; label: string; icon: string; ratio: string }[] = [
    { id: 'instagram', label: 'Instagram Post', icon: '📱', ratio: '1:1' },
    { id: 'telegram', label: 'Telegram', icon: '📐', ratio: '4:3' },
    { id: 'story', label: 'Story / Reels', icon: '📺', ratio: '9:16' },
];

const STYLE_OPTIONS: { id: DesignStyle; label: string; icon: string; gradient: string }[] = [
    { id: 'infographic', label: 'Zamonaviy Infografika', icon: '📊', gradient: 'from-blue-500 to-cyan-400' },
    { id: 'photorealistic', label: 'Fotorealistik', icon: '📸', gradient: 'from-amber-500 to-orange-400' },
    { id: '3d', label: '3D Illyustratsiya', icon: '🎨', gradient: 'from-purple-500 to-pink-400' },
    { id: 'minimalism', label: 'Minimalizm', icon: '✨', gradient: 'from-emerald-500 to-teal-400' },
];

const SAMPLES = [
    {
        id: 'sample1',
        title: 'IT Kursi Reklamasi',
        description: "Zamonaviy IT akademiyasi uchun dasturlash kursi. Moviy va binafsha rangli neon chiroqlar, professional infografika, 'Noldan boshlab o'rganing' matni bilan.",
        format: 'instagram' as BannerFormat,
        style: 'infographic' as DesignStyle,
        image: '/previews/design_sample_1.png',
        icon: '💻',
        badge: 'Infografika',
        gradient: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
        id: 'sample2',
        title: 'Kofe Brendi Reklamasi',
        description: 'Estetik va minimalistik uslubdagi qahvaxona reklama afishasi. Stol ustida issiq kofe finjoni, orqada shinam kafe muhiti, fotorealistik uslub, yumshoq iliq ranglar.',
        format: 'telegram' as BannerFormat,
        style: 'photorealistic' as DesignStyle,
        image: '/previews/design_sample_2.png',
        icon: '☕',
        badge: 'Realistik',
        gradient: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
        id: 'sample3',
        title: 'Sport Krossovkalari',
        description: 'Yangi trenddagi sport krossovkalari reklamasi. Havoda suzib yurgan 3D krossovka, atrofida neon chiziqlar, yorqin binafsha va pushti ranglar, futuristik muhit.',
        format: 'story' as BannerFormat,
        style: '3d' as DesignStyle,
        image: '/previews/design_sample_3.png',
        icon: '👟',
        badge: '3D Dizayn',
        gradient: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
        id: 'sample4',
        title: 'Kitob Taqdimoti',
        description: 'Minimalistik uslubdagi kitob taqdimoti banneri. Oq fonda och yashil barglar, chiroyli yozilgan kitob nomi va muallifi, tinch va toza kompozitsiya.',
        format: 'instagram' as BannerFormat,
        style: 'minimalism' as DesignStyle,
        image: '/previews/design_sample_4.png',
        icon: '📚',
        badge: 'Minimalizm',
        gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    }
];

const TIPS = [
    "💡 ByteDance Seedream 5.0 Flash modeli 1K yuqori aniqlikdagi rasmlarni tezkor generatsiya qiladi.",
    "🎯 Aniqroq tavsif bersangiz, natija shuncha yaxshi bo'ladi.",
    "🌈 AI bir necha soniyada professional dizayner darajasida ishlay oladi.",
    "✨ Har bir buyurtmada 3 ta noyob Seedream varianti tayyorlanadi.",
    "📐 Dizayn avtomatik ravishda tanlangan formatga moslashtiriladi.",
];

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export const DesignForm: React.FC<DesignFormProps> = ({ isDark, referralCredits = 0, isAdmin = false, onOpenReferral }) => {
    const [screen, setScreen] = useState<DesignScreen>('form');
    const [description, setDescription] = useState('');
    const [selectedFormat, setSelectedFormat] = useState<BannerFormat>('instagram');
    const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('infographic');
    const [selectedLang, setSelectedLang] = useState<'uz' | 'kaa' | 'ru' | 'en'>('uz');

    // Loading state
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    // Gallery state
    const [variants, setVariants] = useState<string[]>([]);

    // Preview state
    const [previewUrl, setPreviewUrl] = useState('');

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Track preview source
    const [isPreviewingSample, setIsPreviewingSample] = useState(false);

    const canAfford = referralCredits >= 1 || isAdmin;

    // ── Design generation API call ──────────────────────────
    useEffect(() => {
        if (screen !== 'loading') return;
        setProgress(0);
        setTipIndex(0);

        // Progress bar
        const progTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) { clearInterval(progTimer); return 95; }
                const jump = prev < 30 ? 3 : prev < 60 ? 2 : 1;
                return Math.min(prev + jump, 95);
            });
        }, 200);

        // Rotate tips
        const tipTimer = setInterval(() => {
            setTipIndex(prev => (prev + 1) % TIPS.length);
        }, 3500);

        let active = true;
        const runApi = async () => {
            try {
                const data = await generateDesign({
                    description,
                    format: selectedFormat,
                    style: selectedStyle,
                    lang: selectedLang,
                    send_to_telegram: true
                });
                if (!active) return;
                
                setProgress(100);
                clearInterval(progTimer);
                
                if (data.images && data.images.length > 0) {
                    setVariants(data.images);
                } else {
                    throw new Error("Dizayn variantlari qaytarilmadi");
                }
                
                setTimeout(() => {
                    if (active) setScreen('gallery');
                }, 500);
            } catch (err: any) {
                if (!active) return;
                clearInterval(progTimer);
                showAlert(err.message || "Dizayn yaratishda xatolik yuz berdi");
                setScreen('form');
            }
        };

        runApi();

        return () => {
            active = false;
            clearInterval(progTimer);
            clearInterval(tipTimer);
        };
    }, [screen]);

    // ── Handlers ────────────────────────────────────────────
    const handleGenerate = useCallback(() => {
        if (!description.trim()) return;
        if (!canAfford) {
            if (onOpenReferral) {
                onOpenReferral();
            } else {
                showAlert("Dizayn yaratish uchun 1 kvota kerak. Do'stingizni taklif qiling!");
            }
            return;
        }
        setShowConfirmModal(true);
    }, [description, canAfford, onOpenReferral]);

    const handleRegenerate = useCallback(() => {
        setScreen('loading');
    }, []);

    const openPreview = useCallback((url: string, isSample: boolean = false) => {
        setPreviewUrl(url);
        setIsPreviewingSample(isSample);
        setScreen('preview');
    }, []);

    const handleDownload = useCallback(async () => {
        if (!previewUrl) return;
        try {
            const res = await fetch(previewUrl);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `pro-design-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch { /* ignore */ }
    }, [previewUrl]);

    const handleShare = useCallback(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.switchInlineQuery('Mening yangi dizaynim! ✨', ['users']);
        }
    }, []);

    const goBack = useCallback(() => {
        if (screen === 'preview') setScreen('gallery');
        else if (screen === 'gallery') setScreen('form');
        else if (screen === 'loading') setScreen('form');
    }, [screen]);

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-y-auto flex flex-col relative">
            {screen === 'form' && renderForm()}
            {screen === 'loading' && renderLoading()}
            {screen === 'gallery' && renderGallery()}
            {screen === 'preview' && renderPreview()}
            {showConfirmModal && renderConfirmModal()}
            <DesignStyles />
        </div>
    );

    // ════════════════════════════════════════════════════════
    // CONFIRMATION MODAL
    // ════════════════════════════════════════════════════════
    function renderConfirmModal() {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-slate-950/70 backdrop-blur-sm"
                 style={{ animation: 'dFadeIn 0.2s ease-out' }}>
                <div className={`w-full max-w-sm rounded-3xl p-6 border text-center shadow-2xl ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`} style={{ animation: 'dModalScale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        ⚠️
                    </div>
                    <h3 className="text-sm font-extrabold mb-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
                        Tavsifni tasdiqlang
                    </h3>
                    <p className={`text-[11px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        1 kvota sarflanadi va Seedream 5.0 Flash orqali 3 ta alohida dizayn varianti tayyorlanadi. Mahsulot yoki g'oya tavsifi to'liq yozilganligiga ishonchingiz komilmi?
                    </p>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowConfirmModal(false);
                                setScreen('loading');
                            }}
                            className="w-full py-3 rounded-2xl text-xs font-bold text-white transition-all active:scale-[0.98] shadow-md shadow-orange-500/20"
                            style={{ background: 'linear-gradient(135deg,#f59e0b,#ec4899)' }}
                        >
                            HA, ISHONCHIM KOMIL
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className={`w-full py-3 rounded-2xl text-xs font-bold border transition-colors active:scale-[0.98] ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            YO'Q, TAHRIRLASH
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // SCREEN 1: FORM
    // ════════════════════════════════════════════════════════
    function renderForm() {
        return (
            <>
                {/* Header banner */}
                <div className="relative overflow-hidden px-5 pt-4 pb-3">
                    <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)', animation: 'dPulse 4s ease-in-out infinite alternate' }} />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>⚡</div>
                            <div>
                                <h2 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">PRO-DESIGN AI</h2>
                                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Grafik dizayn — bir lahzada</p>
                            </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>BETA</div>
                    </div>
                </div>

                {/* Form body */}
                <div className="px-5 pt-2 pb-5 flex flex-col gap-5 flex-1">
                    {/* Textarea */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                            <span>💡</span> Mahsulotingiz yoki g'oyangiz haqida yozing
                        </label>
                        <div className="relative">
                            <textarea id="design-description" value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                placeholder="Masalan: IT akademiyamiz uchun dasturlash va grafik dizayn kurslari reklamasi..."
                                className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none transition-all duration-300 focus:ring-2 ${isDark ? 'bg-slate-900/80 border-slate-700 text-slate-50 placeholder-slate-500 focus:ring-indigo-500/50' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-indigo-400/50'}`} />
                            {description.length > 0 && <span className={`absolute bottom-2 right-3 text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description.length}</span>}
                        </div>
                    </div>

                    {/* Language chips */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                            <span>🌐</span> Reklama (Matn) tili
                        </label>
                        <div className="flex gap-2">
                            {(['uz', 'kaa', 'ru', 'en'] as const).map(lang => {
                                const on = selectedLang === lang;
                                const labels = {
                                    uz: "O'zbek",
                                    kaa: "Qoraqalpoq",
                                    ru: "Русский",
                                    en: "English"
                                };
                                const flags = {
                                    uz: "🇺🇿",
                                    kaa: "🇺🇿",
                                    ru: "🇷🇺",
                                    en: "🇬🇧"
                                };
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setSelectedLang(lang)}
                                        className={`flex-1 py-2 rounded-2xl text-[11px] font-semibold border transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                            on 
                                                ? 'text-white border-transparent shadow-lg scale-[1.03]' 
                                                : isDark 
                                                    ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
                                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                        style={on ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,.4)' } : undefined}
                                    >
                                        <span>{flags[lang]}</span>
                                        <span>{labels[lang]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Format chips */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5"><span>📏</span> Banner formati (Hajmi)</label>
                        <div className="flex flex-wrap gap-2">
                            {FORMAT_OPTIONS.map(fmt => {
                                const on = selectedFormat === fmt.id;
                                return (
                                    <button key={fmt.id} type="button" onClick={() => setSelectedFormat(fmt.id)}
                                        className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all duration-300 flex items-center gap-2 ${on ? 'text-white border-transparent shadow-lg scale-[1.03]' : isDark ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                        style={on ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,.4)' } : undefined}>
                                        <span className="text-sm">{fmt.icon}</span><span>{fmt.label}</span>
                                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${on ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{fmt.ratio}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Style cards */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5"><span>🎭</span> Dizayn uslubi (Style)</label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {STYLE_OPTIONS.map(st => {
                                const on = selectedStyle === st.id;
                                return (
                                    <button key={st.id} type="button" onClick={() => setSelectedStyle(st.id)}
                                        className={`relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-300 group ${on ? (isDark ? 'border-white/20 shadow-xl scale-[1.02]' : 'border-slate-800/20 shadow-xl scale-[1.02]') : isDark ? 'bg-slate-900/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                                        style={on ? { background: isDark ? 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))' : 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05))' } : undefined}>
                                        <div className="relative flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{st.icon}</span>
                                                {on && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />}
                                            </div>
                                            <span className={`text-[11px] font-bold leading-tight ${on ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{st.label}</span>
                                        </div>
                                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${st.gradient} transition-opacity ${on ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grid of Samples */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                            <span>✨</span> Tayyor namunalar (Tanlash uchun bosing)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {SAMPLES.map(sample => {
                                const isSelected = description === sample.description;
                                return (
                                    <div
                                        key={sample.id}
                                        onClick={() => {
                                            setDescription(sample.description);
                                            setSelectedFormat(sample.format);
                                            setSelectedStyle(sample.style);
                                        }}
                                        className={`flex flex-col text-left rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg relative ${
                                            isSelected
                                                ? isDark 
                                                    ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                                    : 'border-indigo-600 bg-indigo-50/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                                                : isDark 
                                                    ? 'bg-slate-900/40 border-slate-700/60 hover:border-slate-600' 
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Image Preview Container */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                                            <img 
                                                src={sample.image} 
                                                alt={sample.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                            
                                            {/* Badge */}
                                            <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                                                isDark ? sample.gradient : sample.gradient.replace('text-', 'text-').replace('/20', '/10')
                                            }`}>
                                                {sample.badge}
                                            </span>
                                            
                                            {/* Eye (Glazok) button in the top right corner */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openPreview(sample.image, true);
                                                }}
                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-indigo-600 text-white flex items-center justify-center backdrop-blur-sm shadow-md transition-all active:scale-90 z-10"
                                                title="Kengaytirib ko'rish"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </button>

                                            {/* Icon */}
                                            <span className="absolute bottom-2 right-2 text-base bg-slate-900/60 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md">
                                                {sample.icon}
                                            </span>
                                        </div>
                                        
                                        {/* Text Content */}
                                        <div className="p-3 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                                        {sample.title}
                                                    </h4>
                                                    {isSelected && (
                                                        <span className="text-[10px] font-bold text-indigo-400 flex items-center shrink-0">
                                                            ✓ Tanlandi
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] line-clamp-2 mt-1 leading-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {sample.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price */}
                    <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dizayn narxi:</span>
                        <span className={`text-xs font-extrabold ${canAfford ? 'text-pink-400' : 'text-red-400'}`}>1 kvota (3 ta Seedream varianti)</span>
                    </div>
                </div>

                {/* Generate button */}
                <button id="design-generate-btn" type="button" onClick={handleGenerate} disabled={!description.trim() || !canAfford}
                    className="w-full px-5 py-4 rounded-b-3xl text-sm font-extrabold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899,#f59e0b)', backgroundSize: '200% 200%', animation: 'dGrad 3s ease infinite' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.5) 50%,transparent 60%)', backgroundSize: '200% 100%', animation: 'dShimmer 2s infinite' }} />
                    <span className="relative">✨ DIZAYN YARATISH</span>
                </button>
            </>
        );
    }

    // ════════════════════════════════════════════════════════
    // SCREEN 2: LOADING
    // ════════════════════════════════════════════════════════
    function renderLoading() {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-8">
                {/* Animated icon */}
                <div className="relative">
                    <div className="text-6xl" style={{ animation: 'dBounce 2s ease-in-out infinite' }}>🎨</div>
                    <div className="absolute -top-1 -right-1 text-2xl" style={{ animation: 'dSparkle 1.5s ease-in-out infinite' }}>✨</div>
                </div>

                {/* Animated text */}
                <div className="text-center">
                    <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ animation: 'dFadeText 2s ease-in-out infinite' }}>
                        AI noldan dizayn chizmoqda...
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bir necha soniya kuting</p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs">
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#ec4899,#f59e0b)', backgroundSize: '200% 100%', animation: 'dGrad 2s linear infinite' }}>
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)', animation: 'dBarShine 1.5s infinite' }} />
                        </div>
                    </div>
                    <p className={`text-center text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{progress}%</p>
                </div>

                {/* Rotating tips */}
                <div className={`text-center px-5 py-3.5 rounded-2xl border max-w-xs transition-all duration-500 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}
                    key={tipIndex}>
                    <p className={`text-[12px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ animation: 'dTipFade .5s ease-in' }}>
                        {TIPS[tipIndex]}
                    </p>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // SCREEN 3: GALLERY
    // ════════════════════════════════════════════════════════
    function renderGallery() {
        return (
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <button type="button" onClick={goBack} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        ← Orqaga
                    </button>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                        Tayyor variantlar
                    </h3>
                    <div className="w-12" />
                </div>

                {/* Grid */}
                <div className="flex-1 px-4 py-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {variants.map((url, i) => (
                            <button key={i} type="button" onClick={() => openPreview(url, false)}
                                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] ${isDark ? 'border-slate-700 hover:border-indigo-500/50' : 'border-slate-300 hover:border-indigo-400/50'} ${i === 2 ? 'col-span-2 max-w-[50%] mx-auto w-full' : ''}`}
                                style={{ animation: `dSlideUp .4s ease-out ${i * 0.12}s both` }}>
                                <div className="aspect-square bg-gradient-to-br from-indigo-500/10 to-pink-500/10">
                                    <img src={url} alt={`Variant ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                    <span className="text-white text-[11px] font-bold flex items-center gap-1">👁 Ko'rish</span>
                                </div>
                                {/* Badge */}
                                <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-black/50 text-white/90' : 'bg-white/80 text-slate-700'}`}>
                                    #{i + 1}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Regenerate button */}
                <button type="button" onClick={handleRegenerate}
                    className={`mx-4 mb-4 px-5 py-3 rounded-2xl text-xs font-bold border transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}>
                    🔄 BOSHQATDAN GENERATSIYA
                </button>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // SCREEN 4: PREVIEW
    // ════════════════════════════════════════════════════════
    function renderPreview() {
        return (
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <button type="button" onClick={isPreviewingSample ? () => setScreen('form') : goBack} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        {isPreviewingSample ? '← Bosh sahifa' : '← Yopish'}
                    </button>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                        Dizayn Preview
                    </h3>
                    <div className="w-12" />
                </div>

                {/* Image */}
                <div className="flex-1 px-4 py-4 flex items-center justify-center">
                    <div className={`w-full rounded-2xl overflow-hidden border-2 shadow-2xl ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
                        style={{ animation: 'dZoomIn .3s ease-out' }}>
                        <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain" />
                    </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex flex-col gap-2.5">
                    <button type="button" onClick={handleDownload}
                        className="w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        💾 TELEFONGA YUKLAB OLISH
                    </button>
                    <button type="button" onClick={handleShare}
                        className="w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
                        ✈️ TELEGRAM'DA DO'STLARGA ULASHISH
                    </button>
                </div>
            </div>
        );
    }
};

// ── Keyframes ───────────────────────────────────────────────
function DesignStyles() {
    return (
        <style>{`
            @keyframes dGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
            @keyframes dShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
            @keyframes dPulse{0%{opacity:.12}100%{opacity:.22}}
            @keyframes dBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
            @keyframes dSparkle{0%,100%{opacity:1;transform:scale(1) rotate(0deg)}50%{opacity:.5;transform:scale(1.3) rotate(20deg)}}
            @keyframes dFadeText{0%,100%{opacity:1}50%{opacity:.6}}
            @keyframes dBarShine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
            @keyframes dTipFade{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
            @keyframes dSlideUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
            @keyframes dZoomIn{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:scale(1)}}
            @keyframes dFadeIn{0%{opacity:0}100%{opacity:1}}
            @keyframes dModalScale{0%{opacity:0;transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
        `}</style>
    );
}
