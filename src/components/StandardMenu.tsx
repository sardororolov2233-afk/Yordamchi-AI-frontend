import React from 'react';
import { CommerceAccount } from '../api/client';
import { standardAllowance } from '../utils/commerce';
import { FileText, BookOpen, Briefcase, GraduationCap, Image as ImageIcon, CheckSquare, Presentation, FileBadge } from 'lucide-react';

export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    isNew?: boolean;
    price?: string;
}

interface StandardMenuProps {
    isDark: boolean;
    account: CommerceAccount | null;
    onSelectService: (id: string) => void;
}

export const StandardMenu: React.FC<StandardMenuProps> = ({ isDark, account, onSelectService }) => {
    const sharedAllowance = standardAllowance(account, 'article');
    const services: ServiceItem[] = [
        {
            id: 'taqdimot',
            title: 'Taqdimot',
            description: "20 slaydli tayyor akademik fan shablonlari",
            icon: <Presentation size={18} />,
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop',
            isNew: false,
            price: "1 kvota"
        },
        {
            id: 'maqola',
            title: 'Maqola',
            description: "Ilmiy va ommabop maqolalar (DOCX)",
            icon: <FileText size={18} />,
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'obyektivka',
            title: 'Obyektivka tayyorlash',
            description: "Rasmiy ma'lumotnoma (obyektivka) shakllantirish",
            icon: <FileBadge size={18} />,
            image: '/previews/obyektivka.png',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'kurs_ishi',
            title: 'Kurs ishi',
            description: "To'liq rejali akademik kurs ishi",
            icon: <BookOpen size={18} />,
            image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=500&auto=format&fit=crop',
            isNew: true,
            price: "2 kvota"
        },
        {
            id: 'dars_ishlanmasi',
            title: 'Dars ishlanmasi',
            description: "Namunaviy dars ishlanmalari",
            icon: <BookOpen size={18} />,
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'amaliyot_hisoboti',
            title: 'Amaliyot hisoboti',
            description: "Talabalar amaliyot hisobotlari",
            icon: <Briefcase size={18} />,
            image: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'tezis',
            title: 'Tezis / Referat',
            description: "Ilmiy ishlar va referatlar",
            icon: <GraduationCap size={18} />,
            image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'rasm_to_pdf',
            title: 'Rasm to PDF',
            description: "Rasmlarni PDF ga o'girish",
            icon: <ImageIcon size={18} />,
            image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        },
        {
            id: 'test',
            title: 'Test tuzish',
            description: "Turli fanlardan testlar",
            icon: <CheckSquare size={18} />,
            image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&auto=format&fit=crop',
            isNew: true,
            price: "BEPUL"
        }
    ];

    return (
        <div className="px-5 pt-2 pb-5 flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="mb-1">
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Xizmatlar
                </h2>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    O'zingizga kerakli xizmat turini tanlang
                </p>
            </div>
            
            <div className={`rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed ${isDark ? 'border-cyan-500/25 bg-cyan-950/20 text-slate-300' : 'border-cyan-200 bg-cyan-50 text-slate-600'}`} role="status">
                <p className="font-bold">{sharedAllowance.ready ? `Jami bepul limit: ${sharedAllowance.freeRemaining}/3 ta qoldi` : 'Bepul limit tekshirilmoqda'}</p>
                <p className="mt-1">Referat, maqola va obyektivka uchun bitta umumiy 3 talik limit. Tugagach, har bir buyurtma — 1 kvota.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-4">
                {services.map((service, idx) => {
                    const trialService = service.id === 'maqola' ? 'article' : service.id === 'obyektivka' ? 'obyektivka' : service.id === 'tezis' ? 'referat' : null;
                    const allowance = trialService ? standardAllowance(account, trialService) : null;
                    const price = allowance?.label ?? service.price;
                    return (
                    <button
                        key={service.id}
                        onClick={() => onSelectService(service.id)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:scale-[1.03] active:scale-95 flex flex-col h-40 shadow-lg ${
                            isDark 
                                ? 'bg-slate-800 border-slate-700 hover:border-cyan-500/50 shadow-slate-900/50' 
                                : 'bg-white border-slate-200 hover:border-cyan-400/50 shadow-slate-200/50'
                        }`}
                        style={{ animation: `dSlideUp 0.4s ease-out ${idx * 0.05}s both` }}
                    >
                        {/* Background Image Container */}
                        <div className="absolute inset-0 h-[65%] overflow-hidden">
                            <img 
                                src={service.image} 
                                alt={service.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-slate-900/40 via-slate-900/60 to-slate-800' : 'from-black/30 via-slate-100/80 to-white'}`} />
                        </div>

                        {/* Price Badge */}
                        {price && (
                            <span className={`absolute top-2 left-2 backdrop-blur-md text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-md z-10 ${
                                (allowance ? allowance.ready && allowance.requiredCredits === 0 : price === 'BEPUL')
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                                    : 'bg-slate-900/80 text-cyan-300 border border-cyan-400/40'
                            }`}>
                                {price}
                            </span>
                        )}

                        {/* New Badge */}
                        {service.isNew && (
                            <span className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg z-10">
                                YANGI
                            </span>
                        )}

                        {/* Content */}
                        <div className="relative z-10 p-3 h-full flex flex-col justify-end">
                            <div className={`mb-1.5 p-1.5 rounded-xl w-fit shadow-md transition-transform group-hover:-translate-y-1 ${
                                isDark ? 'bg-cyan-500/20 text-cyan-400 backdrop-blur-md border border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                            }`}>
                                {service.icon}
                            </div>
                            <h3 className={`text-xs font-bold leading-tight mb-0.5 transition-colors ${
                                isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
                            }`}>
                                {service.title}
                            </h3>
                            <p className={`text-[9px] leading-tight line-clamp-2 ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                                {service.description}
                            </p>
                        </div>
                    </button>
                    );
                })}
            </div>
            <style>{`
                @keyframes dSlideUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
