import React, { useState, useRef } from 'react';
import { 
    User, Calendar, MapPin, BookOpen, Briefcase, 
    Plus, Trash2, Download, Printer, Copy, Check, Eye, Edit3, 
    Upload, Info, Sparkles, Phone, Mail, Globe, Users,
    ArrowRight, ArrowLeft, FileBadge
} from 'lucide-react';
import { showAlert } from '../utils/telegram';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { generateObyektivka, generateUUID, RelativeItem, WorkItem, CommerceAccount } from '../api/client';
import { standardAllowance } from '../utils/commerce';

interface ObyektivkaFormProps {
    isDark: boolean;
    account: CommerceAccount | null;
    onAccountRefresh?: () => void | Promise<void>;
    onOpenReferral?: () => void;
}

const SAMPLE_DATA = {
    fullName: 'ABDULLAYEV VALISHER NIZOMOVICH',
    currentPosition: '2012 yil 20 fevraldan:\nSud departamenti Sirdaryo viloyat hududiy boshqarmasi sud qarorlarini ijro etish bo\'limining yetakchi inspektori',
    birthDate: '20.08.1985',
    birthPlace: 'Sirdaryo viloyati Guliston shahri',
    livingAddress: 'Istiqlol MFY, Do\'stlik 11 ko\'chasi, 19W/102-uy',
    nationality: 'O\'zbek',
    party: 'Partiyasiz',
    educationLevel: 'Oliy',
    university: '2006 y. Samarqand Davlat universiteti',
    educationForm: 'kunduzgi',
    specialty: 'Huquqshunos',
    academicDegree: 'Yo\'q',
    academicTitle: 'Yo\'q',
    qualificationLevel: 'Yo\'q',
    phone: '+998 88 179 04 09',
    email: 'info@domain.uz',
    languages: ['O\'zbek tili', 'Rus tili'],
    awards: 'Yo\'q',
    deputy: 'Yo\'q',
    workHistory: [
        { id: '1', period: '2002-2006 yy.', description: 'Samarqand Davlat universiteti yuridik fakulteti talabasi' },
        { id: '2', period: '2006-2008 yy.', description: 'Sirdaryo viloyati Guliston tuman sud ijrochilari bo\'linmasining sud ijrochisi' },
        { id: '3', period: '2008-2010 yy.', description: 'Sirdaryo viloyati Boyovut tuman sud ijrochilari bo\'limining katta sud ijrochisi' },
        { id: '4', period: '2010-2012 yy.', description: 'Sud departamenti Sirdaryo viloyat hududiy boshqarmasining inspektori' },
        { id: '5', period: '2012 y.-h.q.', description: 'Sud departamenti Sirdaryo viloyat hududiy boshqarmasi sud qarorlarini ijro etish bo\'limining yetakchi inspektori' }
    ],
    relatives: [
        {
            id: '1',
            relationship: 'Otasi',
            fullName: 'Abdullayev Nizom Omonovich',
            birthYearPlace: '1958 yil, Sirdaryo viloyati Guliston shahri',
            workplacePosition: 'Nafaqada (sobiq agronom)',
            livingAddress: 'Sirdaryo viloyati, Guliston shahri, Do\'stlik ko\'chasi, 19-uy'
        },
        {
            id: '2',
            relationship: 'Onasi',
            fullName: 'Abdullayeva Maryam Po\'latovna',
            birthYearPlace: '1962 yil, Sirdaryo viloyati Mirzaobod tumani',
            workplacePosition: 'Guliston shahar 2-son umumta\'lim maktabi o\'qituvchisi',
            livingAddress: 'Sirdaryo viloyati, Guliston shahri, Do\'stlik ko\'chasi, 19-uy'
        },
        {
            id: '3',
            relationship: 'Rafiqasi',
            fullName: 'Abdullayeva Nargiza Sobirovna',
            birthYearPlace: '1987 yil, Toshkent shahri',
            workplacePosition: 'Sirdaryo viloyati ko\'p tarmoqli tibbiyot markazi hamshirasi',
            livingAddress: 'Guliston shahri, Istiqlol MFY, Do\'stlik 11 ko\'chasi, 19W/102-uy'
        },
        {
            id: '4',
            relationship: 'O\'g\'li',
            fullName: 'Nizomov Sardor Valisher o\'g\'li',
            birthYearPlace: '2010 yil, Guliston shahri',
            workplacePosition: 'Guliston shahar 5-son maktab o\'quvchisi',
            livingAddress: 'Guliston shahri, Istiqlol MFY, Do\'stlik 11 ko\'chasi, 19W/102-uy'
        },
        {
            id: '5',
            relationship: 'Qizi',
            fullName: 'Nizomova Madina Valisher qizi',
            birthYearPlace: '2014 yil, Guliston shahri',
            workplacePosition: 'Guliston shahar 5-son maktab o\'quvchisi',
            livingAddress: 'Guliston shahri, Istiqlol MFY, Do\'stlik 11 ko\'chasi, 19W/102-uy'
        }
    ]
};

const RELATIONSHIP_OPTIONS = [
    { id: 'Otasi', label: 'Otasi (Отаси)' },
    { id: 'Onasi', label: 'Onasi (Онаси)' },
    { id: 'Akasi/Ukasi', label: 'Akasi/Ukasi (Акаси/Укаси)' },
    { id: 'Opasi/Singlisi', label: 'Opasi/Singlisi (Опаси/Синглиси)' },
    { id: "O'g'li", label: "O'g'li (Ўғли)" },
    { id: 'Qizi', label: 'Qizi (Қизи)' },
    { id: 'Rafiqasi', label: 'Rafiqasi (Рафиқаси)' },
    { id: 'Eri', label: 'Eri (Эри)' },
    { id: 'Qaynotasi', label: 'Qaynotasi (Қайнотаси)' },
    { id: 'Qaynonasi', label: 'Qaynonasi (Қайнонаси)' },
    { id: 'Boshqa', label: 'Boshqa qarindosh' }
];

export const ObyektivkaForm: React.FC<ObyektivkaFormProps> = ({ isDark, account, onAccountRefresh, onOpenReferral }) => {
    const allowance = standardAllowance(account, 'obyektivka');

    // Current Step: 'step1' (Asosiy), 'step2' (Qarindoshlar), 'preview' (Ko'rish)
    const [activeStep, setActiveStep] = useState<'step1' | 'step2' | 'preview'>('step1');

    // Form states - BO'SH HOLATDA YUKLANADI (Boshida namuna to'ldirib qo'yilmaydi)
    const [fullName, setFullName] = useState('');
    const [currentPosition, setCurrentPosition] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [birthDate, setBirthDate] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [livingAddress, setLivingAddress] = useState('');
    const [nationality, setNationality] = useState("O'zbek");
    const [party, setParty] = useState("Partiyasiz");
    const [educationLevel, setEducationLevel] = useState('Oliy');
    const [university, setUniversity] = useState('');
    const [educationForm, setEducationForm] = useState('kunduzgi');
    const [specialty, setSpecialty] = useState('');
    const [academicDegree, setAcademicDegree] = useState("Yo'q");
    const [academicTitle, setAcademicTitle] = useState("Yo'q");
    const [qualificationLevel, setQualificationLevel] = useState("Yo'q");
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);
    const [newLang, setNewLang] = useState('');
    const [awards, setAwards] = useState("Yo'q");
    const [deputy, setDeputy] = useState("Yo'q");
    const [workHistory, setWorkHistory] = useState<WorkItem[]>([]);
    const [relatives, setRelatives] = useState<RelativeItem[]>([]);

    // UI helper states
    const [showRules, setShowRules] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [creatingDocx, setCreatingDocx] = useState(false);
    const [completedFingerprint, setCompletedFingerprint] = useState<string | null>(null);
    const submittingRef = useRef(false);
    const requestIdsRef = useRef(new Map<string, string>());
    const currentRequest = {
        fullName, currentPosition, birthDate, birthPlace, livingAddress, nationality, party,
        educationLevel, university, educationForm, specialty, academicDegree, academicTitle,
        qualificationLevel, phone, email, languages, awards, deputy, workHistory, relatives, photoFile
    };
    const fingerprint = JSON.stringify({
        ...currentRequest, photo, photoFile: photoFile ? [photoFile.name, photoFile.size, photoFile.lastModified] : null
    });
    const canExport = completedFingerprint === fingerprint;
    const createDisabled = creatingDocx || !allowance.ready || !allowance.allowed || canExport;
    const createLabel = canExport ? 'DOCX tayyorlandi' : `Obyektivkani yaratish (${allowance.label})`;
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quick option presets
    const NATIONALITIES = ["O'zbek", "Rus", "Qoraqalpoq", "Qozoq", "Tojik", "Boshqa"];
    const PARTIES = ["Partiyasiz", "O'zLiDeP", "Milliy Tiklanish", "Adolat", "XDP", "Ekologik partiya"];
    const EDU_LEVELS = ["Oliy", "O'rta maxsus", "O'rta", "Tugallanmagan oliy"];
    const EDU_FORMS = [
        { id: 'kunduzgi', label: 'Kunduzgi' },
        { id: 'sirtqi', label: 'Sirtqi' },
        { id: 'kechki', label: 'Kechki' },
        { id: 'masofaviy', label: 'Masofaviy' },
    ];
    const ACADEMIC_DEGREES = ["Yo'q", "PhD", "DSc", "Fan nomzodi", "Fan doktori"];
    const ACADEMIC_TITLES = ["Yo'q", "Dotsent", "Professor", "Katta ilmiy xodim"];
    const QUALIFICATION_LEVELS = ["Yo'q", "Oliy toifa", "1-toifa", "2-toifa"];
    const POPULAR_LANGUAGES = ["O'zbek tili", "Rus tili", "Ingliz tili", "Nemis tili", "Turk tili", "Arab tili", "Koreys tili", "Xitoy tili"];

    // Handlers
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAddLanguage = (langToAdd: string) => {
        const trimmed = langToAdd.trim();
        if (trimmed && !languages.includes(trimmed)) {
            setLanguages([...languages, trimmed]);
            setNewLang('');
        }
    };

    const handleRemoveLanguage = (langToRemove: string) => {
        setLanguages(languages.filter(l => l !== langToRemove));
    };

    const handleAddWorkItem = () => {
        const newItem: WorkItem = {
            id: Date.now().toString(),
            period: '20..-20.. yy.',
            description: 'Tashkilot nomi va lavozim'
        };
        setWorkHistory([...workHistory, newItem]);
    };

    const handleUpdateWorkItem = (id: string, field: 'period' | 'description', value: string) => {
        setWorkHistory(workHistory.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveWorkItem = (id: string) => {
        setWorkHistory(workHistory.filter(item => item.id !== id));
    };

    // Relative handlers
    const handleAddRelative = (relationship: string = 'Otasi') => {
        const newRel: RelativeItem = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
            relationship,
            fullName: '',
            birthYearPlace: '',
            workplacePosition: '',
            livingAddress: ''
        };
        setRelatives(prev => [...prev, newRel]);
    };

    const handleUpdateRelative = (id: string, field: keyof RelativeItem, value: string) => {
        setRelatives(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveRelative = (id: string) => {
        setRelatives(prev => prev.filter(item => item.id !== id));
    };

    const handleLoadSample = () => {
        setFullName(SAMPLE_DATA.fullName);
        setCurrentPosition(SAMPLE_DATA.currentPosition);
        setBirthDate(SAMPLE_DATA.birthDate);
        setBirthPlace(SAMPLE_DATA.birthPlace);
        setLivingAddress(SAMPLE_DATA.livingAddress);
        setNationality(SAMPLE_DATA.nationality);
        setParty(SAMPLE_DATA.party);
        setEducationLevel(SAMPLE_DATA.educationLevel);
        setUniversity(SAMPLE_DATA.university);
        setEducationForm(SAMPLE_DATA.educationForm);
        setSpecialty(SAMPLE_DATA.specialty);
        setAcademicDegree(SAMPLE_DATA.academicDegree);
        setAcademicTitle(SAMPLE_DATA.academicTitle);
        setQualificationLevel(SAMPLE_DATA.qualificationLevel);
        setPhone(SAMPLE_DATA.phone);
        setEmail(SAMPLE_DATA.email);
        setLanguages(SAMPLE_DATA.languages);
        setAwards(SAMPLE_DATA.awards);
        setDeputy(SAMPLE_DATA.deputy);
        setWorkHistory(SAMPLE_DATA.workHistory);
        setRelatives(SAMPLE_DATA.relatives);
        setPhoto('/previews/obyektivka.png');
        setPhotoFile(null);
        showAlert('Namuna ma\'lumotlari muvaffaqiyatli yuklandi!');
    };

    const handleClearForm = () => {
        setFullName('');
        setCurrentPosition('');
        setBirthDate('');
        setBirthPlace('');
        setLivingAddress('');
        setNationality("O'zbek");
        setParty("Partiyasiz");
        setEducationLevel('Oliy');
        setUniversity('');
        setEducationForm('kunduzgi');
        setSpecialty('');
        setAcademicDegree("Yo'q");
        setAcademicTitle("Yo'q");
        setQualificationLevel("Yo'q");
        setPhone('');
        setEmail('');
        setLanguages([]);
        setAwards("Yo'q");
        setDeputy("Yo'q");
        setWorkHistory([]);
        setRelatives([]);
        setPhoto(null);
        setPhotoFile(null);
        showAlert('Forma tozalandi!');
    };

    const handleCreateObyektivka = async () => {
        if (submittingRef.current || creatingDocx || canExport) return;
        if (!allowance.ready) {
            showAlert('Hisob ma’lumotlari yuklanmoqda. Birozdan so‘ng qayta urinib ko‘ring.');
            return;
        }
        if (!allowance.allowed) {
            showAlert('Umumiy bepul limit tugagan. Obyektivka uchun 1 kvota kerak. Do‘st taklif qilib kvota oling.');
            onOpenReferral?.();
            return;
        }
        if (!fullName.trim()) {
            showAlert("Iltimos, avval F.I.SH. (ism, familiya, sharif)ni kiriting!");
            setActiveStep('step1');
            return;
        }


        submittingRef.current = true;
        setCreatingDocx(true);
        const submittedFingerprint = fingerprint;
        let requestId = requestIdsRef.current.get(submittedFingerprint);
        if (!requestId) {
            requestId = generateUUID();
            requestIdsRef.current.set(submittedFingerprint, requestId);
        }
        try {
            const res = await generateObyektivka({
                fullName,
                currentPosition,
                birthDate,
                birthPlace,
                livingAddress,
                nationality,
                party,
                educationLevel,
                university,
                educationForm,
                specialty,
                academicDegree,
                academicTitle,
                qualificationLevel,
                phone,
                email,
                languages,
                awards,
                deputy,
                workHistory,
                relatives,
                photoFile
            }, requestId);
            setCompletedFingerprint(submittedFingerprint);

            if (res.telegram_sent) {
                showAlert("Obyektivka tayyorlandi va tayyor DOCX fayli Telegram botingizga yuborildi.");
                if (window.Telegram?.WebApp) {
                    setTimeout(() => {
                        window.Telegram?.WebApp?.close();
                    }, 2200);
                }
            } else {
                showAlert(res.message || "Obyektivka DOCX hujjati muvaffaqiyatli tayyorlandi!");
            }
        } catch (err: any) {
            showAlert(`Xatolik: ${err.message || 'Server bilan bog\'lanishda muammo yuz berdi'}`);
        } finally {
            try {
                await onAccountRefresh?.();
            } catch {
                // Keep the generation result; a failed refresh must not create another order.
            } finally {
                submittingRef.current = false;
                setCreatingDocx(false);
            }
        }
    };

    const ensureExportReady = () => {
        if (canExport) return true;
        showAlert('Avval shu ma’lumotlar uchun DOCX yarating. So‘ng nusxa, PDF va chop etish qo‘shimcha kvotasiz ishlaydi.');
        return false;
    };

    const handleCopyText = () => {
        if (!ensureExportReady()) return;
        const text = `
МАЪЛУМОТНОМА
${fullName}

${currentPosition}

Туғилган йили: ${birthDate}
Туғилган жойи: ${birthPlace}
Яшаш манзили: ${livingAddress}
Миллати: ${nationality}
Партиявийлиги: ${party}
Маълумоти: ${educationLevel}
Тамомлаган: ${university}${educationLevel === 'Oliy' && educationForm ? ` (${educationForm})` : ''}
Маълумоти бўйича мутахассислиги: ${specialty}
Илмий даражаси: ${academicDegree}
Илмий унвони: ${academicTitle}
Малака даражаси: ${qualificationLevel}
Қайси чет тилларини билади: ${languages.join(', ') || 'йўқ'}
Давлат мукофотлари билан тақдирланганми: ${awards}
Халқ депутатлари кенгаши депутатими: ${deputy}
Телефон: ${phone}
E-mail: ${email}

МЕҲНАТ ФАОЛИЯТИ:
${workHistory.map(w => `${w.period} - ${w.description}`).join('\n') || 'Киритилмаган'}

ЯҚИН ҚАРИНДОШЛАРИ ТЎҒРИСИДА МАЪЛУМОТ:
${relatives.map(r => `${r.relationship}: ${r.fullName}, ${r.birthYearPlace}, ${r.workplacePosition}, ${r.livingAddress}`).join('\n') || 'Киритилмаган'}
        `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showAlert('Obyektivka matni nusxalandi!');
    };

    const handleDownloadPdf = async () => {
        if (!ensureExportReady() || downloading) return;
        setDownloading(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            if (page1Ref.current) {
                const dataUrl1 = await toPng(page1Ref.current, {
                    quality: 0.95,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff'
                });
                const imgProps1 = pdf.getImageProperties(dataUrl1);
                const h1 = (imgProps1.height * pdfWidth) / imgProps1.width;
                pdf.addImage(dataUrl1, 'PNG', 0, 0, pdfWidth, Math.min(h1, pdfHeight));
            }

            if (page2Ref.current) {
                pdf.addPage();
                const dataUrl2 = await toPng(page2Ref.current, {
                    quality: 0.95,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff'
                });
                const imgProps2 = pdf.getImageProperties(dataUrl2);
                const h2 = (imgProps2.height * pdfWidth) / imgProps2.width;
                pdf.addImage(dataUrl2, 'PNG', 0, 0, pdfWidth, Math.min(h2, pdfHeight));
            }

            const fileName = `${fullName ? fullName.replace(/\s+/g, '_') : 'Obyektivka'}_malumotnoma.pdf`;
            pdf.save(fileName);
            showAlert('Obyektivka PDF fayli yuklab olindi!');
        } catch (err) {
            console.error('PDF error:', err);
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    const inputClasses = `w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all focus:ring-2 focus:ring-[#00c2cb]/50 ${
        isDark ? 'bg-slate-900/90 border-slate-700 text-slate-50 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
    }`;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Wizard Steps / Actions Bar */}
            <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 z-10 ${
                isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100/80 border-slate-200'
            }`}>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/20 max-w-[65%] overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveStep('step1')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeStep === 'step1'
                                ? 'bg-[#00c2cb] text-white shadow-md'
                                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')
                        }`}
                    >
                        <Edit3 size={13} />
                        <span>1. Asosiy</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStep('step2')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeStep === 'step2'
                                ? 'bg-[#00c2cb] text-white shadow-md'
                                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')
                        }`}
                    >
                        <Users size={13} />
                        <span>2. Qarindoshlar</span>
                        {relatives.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
                                {relatives.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStep('preview')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeStep === 'preview'
                                ? 'bg-[#00c2cb] text-white shadow-md'
                                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')
                        }`}
                    >
                        <Eye size={13} />
                        <span>Ko'rish</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handleLoadSample}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/30"
                        title="Namunani yuklash"
                    >
                        <Sparkles size={13} />
                        <span className="hidden sm:inline">Namuna</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleClearForm}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                            isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600 hover:text-white' : 'bg-slate-200 text-slate-700 border-slate-300 hover:text-black'
                        }`}
                        title="Formani tozalash"
                    >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Tozalash</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowRules(!showRules)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                            showRules 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                : (isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600' : 'bg-slate-200 text-slate-700 border-slate-300')
                        }`}
                    >
                        <Info size={13} />
                        <span>Talablar</span>
                    </button>
                </div>
            </div>

            {/* Official Requirements Card (Expandable) */}
            {showRules && (
                <div className={`p-4 mx-4 mt-3 rounded-2xl border text-[11px] leading-relaxed animate-fadeIn ${
                    isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                            📌 Obyektivka to'ldirish bo'yicha 5 ta asosiy qoida:
                        </span>
                        <button type="button" onClick={() => setShowRules(false)} className="opacity-60 hover:opacity-100 text-xs">✕</button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 opacity-90">
                        <li><strong>Foto rasm:</strong> Hujjat topshirilayotgan vaqtda tushirilgan, orqa foni oq, elektron holda taqdim etilishi shart (3.5x4.5 sm).</li>
                        <li><strong>Ta'lim shakli:</strong> Oliy o'quv yurtini qanday (kunduzgi, sirtqi, kechki) tamomlaganligi qavs ichida ko'rsatiladi.</li>
                        <li><strong>Oraliq davr:</strong> Maktabdan keyin o'qish/ish boshlanmagan davr izohlanishi lozim (masalan, tayyorlov kursida o'qiganligi).</li>
                        <li><strong>Mehnat uzilishlari:</strong> Ish faoliyatidagi uzilish bo'lgan yillarda nima bilan shug'ullangani qayd etiladi.</li>
                        <li><strong>Korxona faoliyati:</strong> Tashkilot nomi noaniq bo'lsa, qanday faoliyat bilan shug'ullanishi tushuntirilishi shart.</li>
                    </ol>
                </div>
            )}

            {/* ── STEP 1: ASOSIY MA'LUMOTLAR ── */}
            {activeStep === 'step1' && (
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {/* Kirish Qismi: Xizmat tavsifi va xizmat narxi */}
                    <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${
                        isDark 
                            ? 'bg-gradient-to-r from-slate-900/90 via-[#00c2cb]/10 to-slate-900/90 border-[#00c2cb]/35' 
                            : 'bg-gradient-to-r from-cyan-50/80 via-white to-sky-50/80 border-[#00c2cb]/40 shadow-slate-200/60'
                    }`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00c2cb] to-[#0284c7] text-white flex items-center justify-center shadow-md shadow-[#00c2cb]/20 flex-shrink-0">
                                <FileBadge size={22} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs sm:text-sm font-bold truncate">
                                        Obyektivka (Ma'lumotnoma)
                                    </h3>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#00c2cb]/15 text-[#00c2cb] border border-[#00c2cb]/30 flex-shrink-0">
                                        DOCX
                                    </span>
                                </div>
                                <p className="text-[11px] opacity-65 truncate">
                                    Davlat standarti bo'yicha 2 sahifali rasmiy shakl
                                </p>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0 pl-3 border-l border-slate-700/20">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                                Xizmat narxi
                            </span>
                            <span className="text-sm sm:text-base font-black text-[#00c2cb]">
                                {allowance.label}
                            </span>
                        </div>
                    </div>

                    <div className={`rounded-xl border p-3 text-xs ${isDark ? 'border-cyan-500/25 bg-cyan-500/5 text-cyan-100' : 'border-cyan-200 bg-cyan-50 text-cyan-900'}`} aria-live="polite">
                        <p>{allowance.note}</p>
                        <p className="mt-1 opacity-75">Referat, maqola va obyektivka bitta umumiy bepul limitdan foydalanadi.</p>
                        {allowance.ready && !allowance.allowed && onOpenReferral && (
                            <button type="button" onClick={onOpenReferral} className="mt-2 font-bold underline underline-offset-2">Do‘st taklif qilish</button>
                        )}
                    </div>

                    {/* Section 1: Personal Information & Photo */}
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-700/30">
                            <User size={16} className="text-[#00c2cb]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">1. Shaxsiy ma'lumotlar</h4>
                        </div>

                        {/* Photo Upload & Preview */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className={`w-20 h-26 rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center text-center p-1 relative ${
                                    photo 
                                        ? 'border-[#00c2cb] shadow-md shadow-[#00c2cb]/20' 
                                        : (isDark ? 'border-slate-600 bg-slate-900/60' : 'border-slate-300 bg-slate-50')
                                }`}>
                                    {photo ? (
                                        <img src={photo} alt="3.5x4.5" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload size={18} className="opacity-40 mb-1" />
                                            <span className="text-[9px] font-bold opacity-60">3.5 x 4.5</span>
                                            <span className="text-[8px] opacity-40">Oq fon</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00c2cb]/15 text-[#00c2cb] hover:bg-[#00c2cb]/25 transition-colors border border-[#00c2cb]/30 flex items-center gap-1.5"
                                    >
                                        <Upload size={13} />
                                        <span>Rasm yuklash</span>
                                    </button>
                                    {photo && (
                                        <button
                                            type="button"
                                            onClick={() => { setPhoto(null); setPhotoFile(null); }}
                                            className="px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Rasmni o'chirish"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] opacity-60">
                                    1-talab: Rasm oq fonda, sifatli elektron shaklda (3.5x4.5 sm) bo'lishi lozim.
                                </p>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                F.I.SH. (To'liq ism, familiya, sharif) *
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="ABDULLAYEV VALISHER NIZOMOVICH"
                                className={inputClasses}
                            />
                        </div>

                        {/* Current Position */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                Hozirgi lavozimi va tayinlangan sanasi *
                            </label>
                            <textarea
                                value={currentPosition}
                                onChange={(e) => setCurrentPosition(e.target.value)}
                                rows={2}
                                placeholder="2012 yil 20 fevraldan: Sud departamenti Sirdaryo viloyat..."
                                className={`${inputClasses} resize-none`}
                            />
                        </div>

                        {/* Birth date & Birth place */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                                    <Calendar size={12} /> Tug'ilgan sanasi
                                </label>
                                <input
                                    type="text"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    placeholder="20.08.1985"
                                    className={inputClasses}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                                    <MapPin size={12} /> Tug'ilgan joyi
                                </label>
                                <input
                                    type="text"
                                    value={birthPlace}
                                    onChange={(e) => setBirthPlace(e.target.value)}
                                    placeholder="Sirdaryo viloyati Guliston shahri"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Living Address */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                Yashash joy manzili
                            </label>
                            <input
                                type="text"
                                value={livingAddress}
                                onChange={(e) => setLivingAddress(e.target.value)}
                                placeholder="Istiqlol MFY, Do'stlik 11 ko'chasi, 19W/102-uy"
                                className={inputClasses}
                            />
                        </div>

                        {/* Nationality with Quick Chips */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                    Миллати
                                </label>
                                <span className="text-[10px] font-semibold text-[#00c2cb]">{nationality}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {NATIONALITIES.map(nat => (
                                    <button
                                        key={nat}
                                        type="button"
                                        onClick={() => setNationality(nat)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            nationality === nat
                                                ? 'bg-[#00c2cb] text-white shadow-sm'
                                                : (isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200')
                                        }`}
                                    >
                                        {nat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Party with Quick Chips */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                    Партиявийлиги
                                </label>
                                <span className="text-[10px] font-semibold text-[#00c2cb]">{party}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {PARTIES.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setParty(p)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            party === p
                                                ? 'bg-[#00c2cb] text-white shadow-sm'
                                                : (isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200')
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                                    <Phone size={12} /> Telefon raqami
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+998 90 123 45 67"
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                                    <Mail size={12} /> E-mail
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="info@domain.uz"
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Education & Academic Qualifications */}
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-700/30">
                            <BookOpen size={16} className="text-[#00c2cb]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">2. Ma'lumoti va Mutaxassisligi</h4>
                        </div>

                        {/* Education Level Chips */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                    Маълумоти darajasi
                                </label>
                                <span className="text-[10px] font-semibold text-[#00c2cb]">{educationLevel}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {EDU_LEVELS.map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setEducationLevel(lvl)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            educationLevel === lvl
                                                ? 'bg-[#00c2cb] text-white shadow-sm'
                                                : (isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200')
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* University & Graduation */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                Tamomlagan o'quv yurti va yili
                            </label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                placeholder="2006 y. Samarqand Davlat universiteti"
                                className={inputClasses}
                            />
                        </div>

                        {/* Education Form (2-talab: qavs ichida) - Faqat Oliy ta'lim tanlanganda ko'rsatiladi */}
                        {educationLevel === 'Oliy' && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                        Ta'lim shakli (2-talab: qavs ichida ko'rsatiladi)
                                    </label>
                                    <span className="text-[10px] font-semibold text-[#00c2cb]">({educationForm})</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {EDU_FORMS.map(form => (
                                        <button
                                            key={form.id}
                                            type="button"
                                            onClick={() => setEducationForm(form.id)}
                                            className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                                                educationForm === form.id
                                                    ? 'bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm'
                                                    : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700')
                                            }`}
                                        >
                                            {form.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specialty */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                Ma'lumoti bo'yicha mutaxassisligi
                            </label>
                            <input
                                type="text"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                placeholder="Huquqshunos, Iqtisodchi..."
                                className={inputClasses}
                            />
                        </div>

                        {/* Academic Degree & Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Degree */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                    Ilmiy darajasi
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {ACADEMIC_DEGREES.map(deg => (
                                        <button
                                            key={deg}
                                            type="button"
                                            onClick={() => setAcademicDegree(deg)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                                academicDegree === deg
                                                    ? 'bg-[#00c2cb] text-white'
                                                    : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                            }`}
                                        >
                                            {deg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                    Ilmiy unvoni
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {ACADEMIC_TITLES.map(tit => (
                                        <button
                                            key={tit}
                                            type="button"
                                            onClick={() => setAcademicTitle(tit)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                                academicTitle === tit
                                                    ? 'bg-[#00c2cb] text-white'
                                                    : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                            }`}
                                        >
                                            {tit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Qualification Level */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                Malaka darajasi
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {QUALIFICATION_LEVELS.map(q => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => setQualificationLevel(q)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            qualificationLevel === q
                                                ? 'bg-[#00c2cb] text-white'
                                                : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200/70 text-slate-700')
                                        }`}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Work Experience (Mehnat faoliyati) */}
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                            <div className="flex items-center gap-2">
                                <Briefcase size={16} className="text-[#00c2cb]" />
                                <h4 className="text-xs font-bold uppercase tracking-wider">3. Mehnat faoliyati</h4>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddWorkItem}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#00c2cb] text-white hover:bg-[#00b0b8] transition-colors shadow-sm"
                            >
                                <Plus size={14} />
                                <span>Qo'shish</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {workHistory.map((item, index) => (
                                <div 
                                    key={item.id}
                                    className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                                        isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold opacity-50">#{index + 1} davr</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveWorkItem(item.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                                            title="O'chirish"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={item.period}
                                            onChange={(e) => handleUpdateWorkItem(item.id, 'period', e.target.value)}
                                            placeholder="2006-2008 yy."
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleUpdateWorkItem(item.id, 'description', e.target.value)}
                                            placeholder="Tashkilot va lavozim..."
                                            className={`${inputClasses} sm:col-span-2`}
                                        />
                                    </div>
                                </div>
                            ))}

                            {workHistory.length === 0 && (
                                <div className="text-center py-6 opacity-50 text-xs">
                                    Ish tajribasi qo'shilmagan. Yuqoridagi "+ Qo'shish" tugmasini bosing.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Languages, Awards & Public Activity */}
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-700/30">
                            <Globe size={16} className="text-[#00c2cb]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">4. Tillar va Qo'shimcha</h4>
                        </div>

                        {/* Languages with Add button */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                Qaysi chet tillarini biladi
                            </label>

                            {/* Active Languages Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {languages.map(lang => (
                                    <span 
                                        key={lang} 
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#00c2cb]/15 text-[#00c2cb] border border-[#00c2cb]/30"
                                    >
                                        <span>{lang}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveLanguage(lang)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Preset Language chips */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {POPULAR_LANGUAGES.map(pl => {
                                    const isAdded = languages.includes(pl);
                                    return (
                                        <button
                                            key={pl}
                                            type="button"
                                            disabled={isAdded}
                                            onClick={() => handleAddLanguage(pl)}
                                            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                                                isAdded 
                                                    ? 'opacity-40 line-through bg-slate-700/30' 
                                                    : (isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300')
                                            }`}
                                        >
                                            + {pl}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Add Custom Language */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newLang}
                                    onChange={(e) => setNewLang(e.target.value)}
                                    placeholder="Boshqa til nomi..."
                                    className={inputClasses}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddLanguage(newLang);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddLanguage(newLang)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00c2cb] text-white hover:bg-[#00b0b8] transition-colors whitespace-nowrap"
                                >
                                    + Til qo'shish
                                </button>
                            </div>
                        </div>

                        {/* State Awards */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                Davlat mukofotlari bilan taqdirlanganmi (qanaqa)
                            </label>
                            <div className="flex gap-2 mb-1.5">
                                <button
                                    type="button"
                                    onClick={() => setAwards("Yo'q")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        awards === "Yo'q"
                                            ? 'bg-[#00c2cb] text-white'
                                            : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                    }`}
                                >
                                    Йўқ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { if (awards === "Yo'q") setAwards(''); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        awards !== "Yo'q"
                                            ? 'bg-[#00c2cb] text-white'
                                            : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                    }`}
                                >
                                    Бор (кўрсатиш)
                                </button>
                            </div>
                            {awards !== "Yo'q" && (
                                <input
                                    type="text"
                                    value={awards}
                                    onChange={(e) => setAwards(e.target.value)}
                                    placeholder="Mukofot nomi va berilgan yili..."
                                    className={inputClasses}
                                />
                            )}
                        </div>

                        {/* Deputy status */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                                Xalq deputatlari kengashi deputatimi yoki saylanadigan organlar a'zosimi
                            </label>
                            <div className="flex gap-2 mb-1.5">
                                <button
                                    type="button"
                                    onClick={() => setDeputy("Yo'q")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        deputy === "Yo'q"
                                            ? 'bg-[#00c2cb] text-white'
                                            : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                    }`}
                                >
                                    Йўқ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { if (deputy === "Yo'q") setDeputy(''); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        deputy !== "Yo'q"
                                            ? 'bg-[#00c2cb] text-white'
                                            : (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700')
                                    }`}
                                >
                                    Бор (кўрсатиш)
                                </button>
                            </div>
                            {deputy !== "Yo'q" && (
                                <input
                                    type="text"
                                    value={deputy}
                                    onChange={(e) => setDeputy(e.target.value)}
                                    placeholder="Qaysi kengash yoki organ a'zosi..."
                                    className={inputClasses}
                                />
                            )}
                        </div>
                    </div>

                    {/* Step 1 Footer Action: Transition to Step 2 */}
                    <div className="pt-2 pb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveStep('step2');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#00c2cb] via-[#0284c7] to-[#2563eb] shadow-lg shadow-[#00c2cb]/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Keyingi bosqich: Qarindoshlar ma'lumotlari</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: YAҚИН ҚАРИНДОШЛАР МАЪЛУМОТИ ── */}
            {activeStep === 'step2' && (
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 animate-fadeIn">
                    <div className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#00c2cb]/15 flex items-center justify-center text-[#00c2cb]">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider">
                                        2. Yaqin qarindoshlari to'g'risida ma'lumot
                                    </h4>
                                    <p className="text-[10px] opacity-60">
                                        Rasmiy ma'lumotnoma jadvali uchun yaqin qarindoshlar ro'yxati
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAddRelative('Otasi')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00c2cb] text-white hover:bg-[#00b0b8] transition-colors shadow-sm"
                            >
                                <Plus size={14} />
                                <span>Qo'shish</span>
                            </button>
                        </div>

                        {/* Quick add buttons */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                                Tezkor qo'shish:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { rel: 'Otasi', label: '+ Otasi' },
                                    { rel: 'Onasi', label: '+ Onasi' },
                                    { rel: 'Rafiqasi', label: '+ Rafiqasi' },
                                    { rel: 'Eri', label: '+ Eri' },
                                    { rel: "O'g'li", label: "+ O'g'li" },
                                    { rel: 'Qizi', label: '+ Qizi' },
                                    { rel: 'Akasi/Ukasi', label: '+ Akasi/Ukasi' },
                                    { rel: 'Opasi/Singlisi', label: '+ Opasi/Singlisi' },
                                    { rel: 'Qaynotasi', label: '+ Qaynotasi' },
                                    { rel: 'Qaynonasi', label: '+ Qaynonasi' },
                                ].map(btn => (
                                    <button
                                        key={btn.rel}
                                        type="button"
                                        onClick={() => handleAddRelative(btn.rel)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                            isDark 
                                                ? 'bg-slate-700/40 border-slate-600 text-slate-200 hover:bg-[#00c2cb]/20 hover:border-[#00c2cb]/50 hover:text-[#00c2cb]' 
                                                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-[#00c2cb]/15 hover:border-[#00c2cb]/40 hover:text-[#009ca4]'
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Relatives List */}
                        <div className="space-y-3.5 pt-2">
                            {relatives.map((item, index) => (
                                <div 
                                    key={item.id}
                                    className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                                        isDark ? 'bg-slate-900/70 border-slate-700/80 shadow-md' : 'bg-slate-50 border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700/20">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#00c2cb]/20 text-[#00c2cb] text-[10px] font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <span className="text-xs font-bold text-[#00c2cb]">
                                                {item.relationship || 'Qarindoshi'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRelative(item.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                            title="O'chirish"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Dropdown: Relationship selection (Image 4) */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                Qarindoshlikni tanlang *
                                            </label>
                                            <select
                                                value={item.relationship}
                                                onChange={(e) => handleUpdateRelative(item.id, 'relationship', e.target.value)}
                                                className={`${inputClasses} cursor-pointer font-medium`}
                                            >
                                                {RELATIONSHIP_OPTIONS.map(opt => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Full Name */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                Ismi, familiyasi, otasining ismi *
                                            </label>
                                            <input
                                                type="text"
                                                value={item.fullName}
                                                onChange={(e) => handleUpdateRelative(item.id, 'fullName', e.target.value)}
                                                placeholder="Abdullayev Nizom Omonovich"
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Birth year and place */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                Tug'ilgan yili va joyi *
                                            </label>
                                            <input
                                                type="text"
                                                value={item.birthYearPlace}
                                                onChange={(e) => handleUpdateRelative(item.id, 'birthYearPlace', e.target.value)}
                                                placeholder="1958 yil, Sirdaryo viloyati..."
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Workplace and position */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                Ish joyi va lavozimi *
                                            </label>
                                            <input
                                                type="text"
                                                value={item.workplacePosition}
                                                onChange={(e) => handleUpdateRelative(item.id, 'workplacePosition', e.target.value)}
                                                placeholder="Nafaqada / Maktab o'qituvchisi / Vafot etgan..."
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Living address */}
                                        <div className="sm:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                Turar joyi (yashash manzili) *
                                            </label>
                                            <input
                                                type="text"
                                                value={item.livingAddress}
                                                onChange={(e) => handleUpdateRelative(item.id, 'livingAddress', e.target.value)}
                                                placeholder="Sirdaryo viloyati, Guliston shahri, Do'stlik ko'chasi, 19-uy"
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {relatives.length === 0 && (
                                <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-700/50 space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center mx-auto">
                                        <Users size={22} />
                                    </div>
                                    <p className="text-xs font-semibold opacity-80">
                                        Hozircha yaqin qarindoshlar ma'lumoti kiritilmagan.
                                    </p>
                                    <p className="text-[11px] opacity-50">
                                        Yuqoridagi tezkor tugmalar orqali ota-ona, turmush o'rtoq va farzandlar ma'lumotlarini osongina qo'shishingiz mumkin.
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddRelative('Otasi')}
                                className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    isDark ? 'border-slate-700 text-slate-300 hover:border-[#00c2cb] hover:text-[#00c2cb]' : 'border-slate-300 text-slate-600 hover:border-[#00c2cb] hover:text-[#00c2cb]'
                                }`}
                            >
                                <Plus size={15} />
                                <span>+ Yangi qarindosh qo'shish</span>
                            </button>
                        </div>
                    </div>

                    {/* Step 2 Bottom Actions: Back to Step 1 and Generate DOCX Button */}
                    <div className="pt-2 pb-6 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveStep('step1');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                            }`}
                        >
                            <ArrowLeft size={16} />
                            <span>← 1-bosqich: Asosiy ma'lumotlar</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateObyektivka}
                            disabled={createDisabled}
                            className="flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#00c2cb] via-[#0284c7] to-[#2563eb] shadow-lg shadow-[#00c2cb]/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {creatingDocx ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Obyektivka yaratilmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>{createLabel}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── PREVIEW & EXPORT (Ko'rish) ── */}
            {activeStep === 'preview' && (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 animate-fadeIn">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setActiveStep('step1')}
                            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-black'
                            }`}
                        >
                            <Edit3 size={14} />
                            <span>← Tahrirlash</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopyText}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                                }`}
                            >
                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { if (ensureExportReady()) window.print(); }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-black'
                                }`}
                                title="Chop etish"
                            >
                                <Printer size={14} />
                                <span className="hidden sm:inline">Chop etish</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-400/40 text-slate-200 hover:bg-white/10 transition-all"
                            >
                                <Download size={14} />
                                <span>{downloading ? 'Tayyorlanmoqda...' : 'PDF'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCreateObyektivka}
                                disabled={createDisabled}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00c2cb] text-white hover:bg-[#00b0b8] transition-all shadow-md active:scale-95 disabled:opacity-60"
                            >
                                <Sparkles size={14} />
                                <span>{creatingDocx ? 'Yaratilmoqda...' : canExport ? 'DOCX tayyorlandi' : `DOCX yaratish (${allowance.label})`}</span>
                            </button>
                        </div>
                    </div>

                    <p className={`mb-4 rounded-xl border p-3 text-xs ${isDark ? 'border-cyan-500/25 text-cyan-100' : 'border-cyan-200 text-cyan-900'}`} aria-live="polite">
                        {canExport ? 'Shu ma’lumotlar uchun hujjat tayyor. Nusxa, PDF va chop etish qo‘shimcha kvota sarflamaydi.' : `${allowance.note} Nusxa, PDF va chop etish DOCX yaratilgandan keyin ochiladi.`}
                    </p>

                    {/* Official Document Sheets (A4 multi-page visual) */}
                    <div className="flex flex-col items-center gap-6 pb-8">
                        {/* Page 1: Main Obyektivka & Mehnat Faoliyati */}
                        <div className="w-full max-w-[720px] flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-right">
                                1-sahifa (Asosiy ma'lumotnoma)
                            </span>
                            <div 
                                ref={page1Ref}
                                id="obyektivka-page-1"
                                className="w-full bg-white text-black p-6 sm:p-10 shadow-2xl rounded-sm border border-slate-300 text-left font-serif leading-snug"
                                style={{ fontFamily: '"Times New Roman", Times, serif' }}
                            >
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase">
                                        МАЪЛУМОТНОМА
                                    </h2>
                                    <h3 className="text-sm sm:text-base font-bold tracking-wide mt-1 uppercase">
                                        {fullName || 'F.I.SH.'}
                                    </h3>
                                </div>

                                {/* Position and Photo Header row */}
                                <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-black/30">
                                    <div className="flex-1 pr-2">
                                        <p className="text-xs sm:text-sm font-semibold leading-relaxed whitespace-pre-line">
                                            {currentPosition || 'Hozirgi lavozimi ko\'rsatilmagan'}
                                        </p>
                                    </div>
                                    <div className="w-[100px] sm:w-[120px] flex-shrink-0 flex flex-col items-center">
                                        <div className="w-[100px] h-[130px] sm:w-[115px] sm:h-[150px] border border-black p-0.5 bg-white flex items-center justify-center overflow-hidden">
                                            {photo ? (
                                                <img src={photo} alt="Foto 3.5x4.5" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[10px] text-center text-slate-500 font-sans">
                                                    3.5x4.5 sm<br />расм ўрни
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-slate-500 mt-1">расм-4,5#3,5</span>
                                    </div>
                                </div>

                                {/* Main Info 2-Column Table */}
                                <div className="space-y-2 text-xs sm:text-[13px]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        <div>
                                            <span className="font-bold">Туғилган йили:</span>{' '}
                                            <span>{birthDate || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold">Туғилган жойи:</span>{' '}
                                            <span>{birthPlace || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        <div>
                                            <span className="font-bold">Миллати:</span>{' '}
                                            <span>{nationality || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold">Партиявийлиги:</span>{' '}
                                            <span>{party || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        <div>
                                            <span className="font-bold">Маълумоти:</span>{' '}
                                            <span>{educationLevel || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold">Тамомлаган:</span>{' '}
                                            <span>
                                                {university || '—'}
                                                {educationLevel === 'Oliy' && educationForm ? ` (${educationForm})` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="font-bold">Маълумоти бўйича мутахассислиги:</span>{' '}
                                        <span>{specialty || '—'}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        <div>
                                            <span className="font-bold">Илмий даражаси:</span>{' '}
                                            <span>{academicDegree || 'йўқ'}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold">Илмий унвони:</span>{' '}
                                            <span>{academicTitle || 'йўқ'}</span>
                                        </div>
                                    </div>

                                    {qualificationLevel && qualificationLevel !== "Yo'q" && (
                                        <div>
                                            <span className="font-bold">Малака даражаси:</span>{' '}
                                            <span>{qualificationLevel}</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="font-bold">Қайси чет тилларини билади (тўлиқ кўрсатилиши лозим):</span>{' '}
                                        <span>{languages.length > 0 ? languages.join(', ') : 'йўқ'}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold">Давлат мукофотлари билан тақдирланганми (қанақа):</span>{' '}
                                        <span>{awards || 'йўқ'}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold">Халқ депутатлари республика, вилоят, шаҳар ва туман Кенгаши депутатими ёки бошқа сайланадиган органларнинг аъзосими:</span>{' '}
                                        <span>{deputy || 'йўқ'}</span>
                                    </div>

                                    {livingAddress && (
                                        <div>
                                            <span className="font-bold">Яшаш жой манзили:</span>{' '}
                                            <span>{livingAddress}</span>
                                        </div>
                                    )}

                                    {(phone || email) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-700 pt-1">
                                            {phone && <div><span className="font-bold">Тел:</span> {phone}</div>}
                                            {email && <div><span className="font-bold">E-mail:</span> {email}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* MEHNAT FAOLIYATI */}
                                <div className="mt-8 pt-4 border-t border-black/40">
                                    <h4 className="text-center font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">
                                        МЕҲНАТ ФАОЛИЯТИ
                                    </h4>

                                    <div className="space-y-2 text-xs sm:text-[13px]">
                                        {workHistory.map(item => (
                                            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <div className="font-bold sm:col-span-1 text-slate-800">
                                                    {item.period}
                                                </div>
                                                <div className="sm:col-span-3 text-justify">
                                                    {item.description}
                                                </div>
                                            </div>
                                        ))}

                                        {workHistory.length === 0 && (
                                            <p className="text-center italic text-slate-500 text-xs">
                                                Меҳнат фаолияти маълумотлари киритилмаган
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Page 2: Yaqin qarindoshlari to'g'risida ma'lumot (Official 5-Column Table from Image 3) */}
                        <div className="w-full max-w-[720px] flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-right">
                                2-sahifa (Yaqin qarindoshlar jadvali)
                            </span>
                            <div 
                                ref={page2Ref}
                                id="obyektivka-page-2"
                                className="w-full bg-white text-black p-6 sm:p-10 shadow-2xl rounded-sm border border-slate-300 text-left font-serif leading-snug"
                                style={{ fontFamily: '"Times New Roman", Times, serif' }}
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase leading-relaxed">
                                        {fullName ? `${fullName}нинг` : 'Номзоднинг'} яқин қариндошлари тўғрисида
                                    </h2>
                                    <h3 className="text-sm sm:text-base font-bold tracking-wider mt-1 uppercase">
                                        МАЪЛУМОТ
                                    </h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-black text-xs sm:text-[12px] leading-snug">
                                        <thead>
                                            <tr className="bg-slate-100/60 text-center font-bold">
                                                <th className="border border-black p-2 w-[18%]">
                                                    Қариндошлари
                                                </th>
                                                <th className="border border-black p-2 w-[24%]">
                                                    Исми, фамилияси, отасининг исми
                                                </th>
                                                <th className="border border-black p-2 w-[20%]">
                                                    Туғилган йили ва жойи
                                                </th>
                                                <th className="border border-black p-2 w-[20%]">
                                                    Иш жойи ва лавозими
                                                </th>
                                                <th className="border border-black p-2 w-[18%]">
                                                    Турар жойи
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relatives.map((rel) => (
                                                <tr key={rel.id}>
                                                    <td className="border border-black p-2 font-semibold text-center align-top">
                                                        {rel.relationship || '—'}
                                                    </td>
                                                    <td className="border border-black p-2 align-top">
                                                        {rel.fullName || '—'}
                                                    </td>
                                                    <td className="border border-black p-2 align-top">
                                                        {rel.birthYearPlace || '—'}
                                                    </td>
                                                    <td className="border border-black p-2 align-top">
                                                        {rel.workplacePosition || '—'}
                                                    </td>
                                                    <td className="border border-black p-2 align-top">
                                                        {rel.livingAddress || '—'}
                                                    </td>
                                                </tr>
                                            ))}

                                            {relatives.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="border border-black p-6 text-center italic text-slate-500 text-xs">
                                                        Яқин қариндошлар маълумоти киритилмаган
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
