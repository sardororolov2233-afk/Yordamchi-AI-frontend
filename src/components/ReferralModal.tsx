import React, { useState } from 'react';
import { X, Gift, Copy, Check, Share2, Sparkles, BookOpen, Presentation, Palette, FileText, ShieldAlert } from 'lucide-react';
import { CommerceAccount } from '../api/client';
import { standardAllowance } from '../utils/commerce';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    account: CommerceAccount | null;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
    isOpen,
    onClose,
    isDark,
    account,
}) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const referralLink = account?.referral_link || '';
    const sharedAllowance = standardAllowance(account, 'article');

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleShare = () => {
        if (!referralLink) return;
        const text = encodeURIComponent("Orzu AI orqali professional taqdimot, dizayn va ilmiy ishlarni tayyorlang! Bepul kvota olish uchun kiring:");
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
        
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.openTelegramLink) {
            tg.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className={`w-full max-w-md max-h-[90vh] rounded-3xl p-5 shadow-2xl relative flex flex-col overflow-hidden border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                            <Gift size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">Takliflar & Kvota</h3>
                            <p className="text-[10px] opacity-60">Do‘stlarni taklif qilib, bepul kvota oling</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className={`p-1.5 rounded-full transition-colors ${
                            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto py-4 space-y-4 pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                            isDark ? 'bg-slate-800/80 border-cyan-500/30' : 'bg-cyan-50/70 border-cyan-200'
                        }`}>
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                                🎁
                            </div>
                            <div>
                                <span className="text-[10px] font-medium opacity-65 block">Mavjud kvota</span>
                                <span className="text-base font-black text-cyan-400">
                                    {account ? `${account.referral_credits} ta` : '—'}
                                </span>
                            </div>
                        </div>

                        <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                            isDark ? 'bg-slate-800/80 border-blue-500/30' : 'bg-blue-50/70 border-blue-200'
                        }`}>
                            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
                                👥
                            </div>
                            <div>
                                <span className="text-[10px] font-medium opacity-65 block">Do‘stlar soni</span>
                                <span className="text-base font-black text-blue-400">
                                    {account ? `${account.confirmed_referrals} ta` : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Referral Link Box */}
                    <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-cyan-400" />
                            <span>Sizning taklif havolangiz</span>
                        </label>
                        
                        <div className={`p-2.5 rounded-xl border font-mono text-[11px] break-all select-all ${
                            isDark ? 'bg-slate-950 border-slate-800 text-cyan-300' : 'bg-white border-slate-300 text-cyan-700'
                        }`}>
                            {referralLink || 'Yuklanmoqda...'}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                                    copied 
                                        ? 'bg-emerald-600 text-white' 
                                        : (isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800')
                                }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Nusxalandi!' : 'Havolani nusxalash'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                            >
                                <Share2 size={14} />
                                <span>Ulashish</span>
                            </button>
                        </div>
                    </div>

                    {/* How It Works & Pricing */}
                    <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">
                            Kvota va Xizmatlar Qoidasi
                        </span>

                        <div className="space-y-1.5 text-xs">
                            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🎁</span>
                                    <span>Yangi tasdiqlangan do‘st</span>
                                </div>
                                <span className="font-extrabold text-emerald-400">+1 kvota</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Presentation size={15} className="text-cyan-400" />
                                    <span>Taqdimot (20 slaydli to‘liq paket)</span>
                                </div>
                                <span className="font-extrabold text-cyan-400">1 kvota</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Palette size={15} className="text-pink-400" />
                                    <span>Dizayn (3 ta Seedream varianti)</span>
                                </div>
                                <span className="font-extrabold text-pink-400">1 kvota</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={15} className="text-purple-400" />
                                    <span>Kurs ishi</span>
                                </div>
                                <span className="font-extrabold text-purple-400">2 kvota</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <FileText size={15} className="text-emerald-400" />
                                    <span>Maqola, obyektivka, referat</span>
                                </div>
                                <span className="font-extrabold text-emerald-400 whitespace-nowrap">{sharedAllowance.label}</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${isDark ? 'border-emerald-500/25 bg-emerald-950/20 text-slate-300' : 'border-emerald-200 bg-emerald-50 text-slate-600'}`} role="status">
                            <p className="font-bold">{sharedAllowance.ready ? `Umumiy bepul foydalanish: ${sharedAllowance.freeRemaining}/3 ta qoldi` : 'Bepul limit tekshirilmoqda'}</p>
                            <p className="mt-1">Uchala xizmatga jami 3 ta bepul foydalanish beriladi. Keyin har bir buyurtma 1 kvota oladi. Xato bilan tugagan buyurtmaning band qilingan limiti yoki kvotasi qaytariladi.</p>
                        </div>
                    </div>

                    {/* Policy Notice */}
                    <div className={`p-3 rounded-2xl border text-[10.5px] leading-relaxed flex items-start gap-2.5 ${
                        isDark ? 'bg-amber-950/20 border-amber-600/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                        <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-0.5">Muhim qoida</p>
                            <p className="opacity-80">
                                Obuna va pulli xaridlar bekor qilingan. Foydalanuvchilar pul to‘lamaydi; AI model xarajatlarini loyiha egasi qoplaydi. Kvotalar faqat do‘stlarni taklif qilish orqali olinadi va muddatsiz saqlanadi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-slate-700/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        Tushunarli
                    </button>
                </div>
            </div>
        </div>
    );
};
