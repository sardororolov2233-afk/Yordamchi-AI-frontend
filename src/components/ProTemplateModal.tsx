import React, { useState, useMemo } from 'react';
import { X, Search, Check, Maximize2, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { proTemplates, PRO_CATEGORIES } from '../constants/proTemplates';

interface ProTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    selectedSubjectId: string;
    selectedVariant: number;
    onSelect: (subjectId: string, variant: number) => void;
}

export const ProTemplateModal: React.FC<ProTemplateModalProps> = ({
    isOpen,
    onClose,
    isDark,
    selectedSubjectId,
    selectedVariant,
    onSelect,
}) => {
    const [currentSubjectId, setCurrentSubjectId] = useState<string>(selectedSubjectId || 'biologiya');
    const [currentVariant, setCurrentVariant] = useState<number>(selectedVariant || 1);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

    // Sync on open
    React.useEffect(() => {
        if (isOpen) {
            setCurrentSubjectId(selectedSubjectId);
            setCurrentVariant(selectedVariant);
        }
    }, [isOpen, selectedSubjectId, selectedVariant]);

    // Filtered subjects
    const filteredSubjects = useMemo(() => {
        return proTemplates.filter((sub) => {
            const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
            const matchesSearch = searchQuery.trim() === '' ||
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.variants.some(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    // Active subject object
    const activeSubject = useMemo(() => {
        return proTemplates.find(s => s.id === currentSubjectId) || proTemplates[0];
    }, [currentSubjectId]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onSelect(currentSubjectId, currentVariant);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className={`w-full max-w-xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden relative ${
                    isDark ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Modal Header ── */}
                <div className={`p-4 border-b flex items-center justify-between gap-3 ${
                    isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
                }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl flex-shrink-0">{activeSubject.icon}</span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-extrabold truncate">
                                    {activeSubject.name} — Shablonlari
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                                    {activeSubject.variants.length} ta variant
                                </span>
                            </div>
                            <p className="text-[11px] opacity-60 truncate">
                                {activeSubject.description}
                            </p>
                        </div>
                    </div>

                    <button 
                        type="button" 
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-black'
                        }`}
                        title="Yopish"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Search & Category Filter ── */}
                <div className={`p-3 border-b space-y-2.5 ${isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Sohalar yoki shablon nomini qidiring..."
                            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs outline-none border transition-all focus:ring-2 focus:ring-cyan-500/50 ${
                                isDark ? 'bg-slate-800/70 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                            }`}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                        <Filter size={13} className="opacity-40 flex-shrink-0 ml-1" />
                        {PRO_CATEGORIES.map((cat) => {
                            const isCatActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all ${
                                        isCatActive
                                            ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                                            : isDark
                                                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Subject Quick Selector Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {filteredSubjects.map((sub) => {
                            const isSubActive = currentSubjectId === sub.id;
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                        setCurrentSubjectId(sub.id);
                                        setCurrentVariant(1);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                                        isSubActive
                                            ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400 font-bold shadow-sm'
                                            : isDark
                                                ? 'border-slate-700/60 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-white'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-black'
                                    }`}
                                >
                                    <span>{sub.icon}</span>
                                    <span>{sub.name}</span>
                                    <span className="text-[10px] opacity-60">({sub.variants.length})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Variants Grid (Scrollable Body) ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh]">
                    <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-cyan-400" />
                            {activeSubject.name} uchun mavjud shablonlar ({activeSubject.variants.length} ta)
                        </span>
                        <span className="text-[11px] text-cyan-400 font-semibold">
                            Tanlangan: {currentVariant}-variant
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {activeSubject.variants.map((v) => {
                            const isSelected = currentSubjectId === activeSubject.id && currentVariant === v.variant;
                            return (
                                <div
                                    key={v.variant}
                                    onClick={() => setCurrentVariant(v.variant)}
                                    className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col ${
                                        isSelected
                                            ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                                            : isDark
                                                ? 'border-slate-700/70 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
                                                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70'
                                    }`}
                                >
                                    {/* Aspect Ratio 16:9 Image Preview */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                                        <img
                                            src={v.image}
                                            alt={v.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                (e.target as HTMLImageElement).src = '/previews/preview_1.jpg';
                                            }}
                                        />

                                        {/* Zoom Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomedImage({ src: v.image, title: `${activeSubject.name} — ${v.title}` });
                                            }}
                                            className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                            title="Kattalashtirib ko'rish"
                                        >
                                            <Maximize2 size={13} />
                                        </button>

                                        {/* Badge */}
                                        {v.badge && (
                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/90 text-white shadow-md">
                                                {v.badge}
                                            </div>
                                        )}

                                        {/* Selected Indicator Checkmark Overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-cyan-500/25 flex items-center justify-center backdrop-blur-[0.5px]">
                                                <div className="bg-cyan-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                                    <Check size={14} />
                                                    <span>Tanlandi</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Bottom */}
                                    <div className={`p-3 flex-1 flex flex-col justify-between ${
                                        isDark ? 'bg-slate-800/80' : 'bg-white'
                                    }`}>
                                        <div>
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <h4 className="text-xs font-bold truncate">
                                                    {v.variant}-variant: {v.title}
                                                </h4>
                                            </div>
                                            <p className="text-[10px] opacity-65 line-clamp-2">
                                                {v.description}
                                            </p>
                                        </div>

                                        <div className="mt-2.5 pt-2 border-t border-slate-700/20 flex items-center justify-between text-[10px]">
                                            <span className="font-semibold text-cyan-400">
                                                20 ta slayd to'plami
                                            </span>
                                            <span className="font-bold opacity-60">
                                                {isSelected ? 'Faol variant' : 'Tanlash uchun bosing'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Modal Footer (Confirmation) ── */}
                <div className={`p-3.5 border-t flex items-center justify-between gap-3 ${
                    isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
                }`}>
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                            Tanlangan shablon:
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold truncate text-cyan-400">
                            <span>{activeSubject.icon}</span>
                            <span className="truncate">{activeSubject.name} — {currentVariant}-variant</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            Bekor qilish
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] transition-transform shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                        >
                            <span>Tasdiqlash</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Zoom Preview Modal (Fullscreen Lightbox) ── */}
                {zoomedImage && (
                    <div 
                        className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
                        onClick={() => setZoomedImage(null)}
                    >
                        <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                            <div className="w-full flex items-center justify-between pb-3 text-white">
                                <h4 className="text-sm sm:text-base font-bold truncate">
                                    {zoomedImage.title}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setZoomedImage(null)}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <img
                                src={zoomedImage.src}
                                alt={zoomedImage.title}
                                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    setZoomedImage(null);
                                    handleConfirm();
                                }}
                                className="mt-4 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors"
                            >
                                Shu variantni tanlash
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
