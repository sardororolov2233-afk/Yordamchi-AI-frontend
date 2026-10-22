import React, { useState, useEffect } from 'react';
import { Home, Star, Palette, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useTelegramAuth } from './src/hooks/useTelegramAuth';
import { getAccountCommerce, CommerceAccount, generatePresentation } from './src/api/client';
import { Language } from './src/constants/templates';
import { translations } from './src/constants/translations';
import { showAlert } from './src/utils/telegram';
import { Header } from './src/components/Header';
import { DesignForm } from './src/components/DesignForm';
import { proTemplates } from './src/constants/proTemplates';
import { ProTemplateModal } from './src/components/ProTemplateModal';
import { StandardMenu } from './src/components/StandardMenu';
import { ArticleForm } from './src/components/ArticleForm';
import { ObyektivkaForm } from './src/components/ObyektivkaForm';
import { ReferralModal } from './src/components/ReferralModal';
import { JobProgressCard } from './src/components/JobProgressCard';

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useTelegramAuth();

  const queryParams = new URLSearchParams(window.location.search);
  const tabParam = queryParams.get('tab');
  const initialTab = (tabParam === 'designs' ? 'design' : tabParam === 'presentations' || tabParam === 'pro' ? 'pro' : 'standard');
  const [currentPage, setCurrentPage] = useState<'standard' | 'pro' | 'design'>(initialTab);
  const [selectedStandardService, setSelectedStandardService] = useState<string | null>(tabParam === 'articles' ? 'maqola' : null);

  const [language, setLanguage] = useState<Language>('uz');
  const [presentationLanguage, setPresentationLanguage] = useState<Language>('uz');
  const [isDark, setIsDark] = useState(true);

  // Form State
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageMode, setImageMode] = useState<'ai' | 'manual'>('ai');
  const [proBibliographyType, setProBibliographyType] = useState<'none' | 'ai' | 'manual'>('none');
  const [proBibliographyText, setProBibliographyText] = useState('');
  const [proDocumentFormat, setProDocumentFormat] = useState<'ppt' | 'pdf'>('ppt');
  const [selectedProTemplate, setSelectedProTemplate] = useState('minimalizm');
  const [selectedProTemplateVariant, setSelectedProTemplateVariant] = useState<number>(1);
  const [isProTemplateModalOpen, setIsProTemplateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Commerce & Referral State
  const [commerce, setCommerce] = useState<CommerceAccount | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // Active Job State (Durable Order)
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeServiceName, setActiveServiceName] = useState<string>('Taqdimot');

  const referralCredits = commerce?.referral_credits ?? 0;
  const balance = user?.balance ?? 0;
  const t = translations[language];

  // Refresh commerce quota
  const refreshCommerce = async () => {
    try {
      const data = await getAccountCommerce();
      setCommerce(data);
    } catch (e) {
      console.warn('[Commerce fetch error]', e);
    }
  };

  // On user loaded: fetch commerce & check for pending jobs
  useEffect(() => {
    if (user?.id) {
      if (user.first_name && !author) {
        setAuthor(user.first_name);
      }
      refreshCommerce();

      // Restore unfinished job from localStorage
      const savedJob = localStorage.getItem('orzu:job:' + user.id);
      if (savedJob) {
        setActiveJobId(savedJob);
      }
    }
  }, [user?.id]);

  // Handle URL tabs on mount
  useEffect(() => {
    if (tabParam === 'account') {
      setIsReferralModalOpen(true);
    }
  }, [tabParam]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setImageNames([]);
      setImageFiles([]);
      return;
    }
    const fileList = Array.from(files).slice(0, 3);
    if (fileList.some((f) => f.size > 5 * 1024 * 1024)) {
      showAlert("Har bir rasm 5 MB dan kichik bo'lishi kerak");
      return;
    }
    setImageFiles(fileList);
    setImageNames(fileList.map((f) => f.name));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showAlert('Mavzuni kiriting');
      return;
    }

    const hasQuota = referralCredits >= 1 || user?.role === 'admin';
    if (!hasQuota) {
      setIsReferralModalOpen(true);
      showAlert("Taqdimot yaratish uchun 1 kvota kerak. Do'stingizni taklif qilib, bepul kvota oling!");
      return;
    }

    setGenerating(true);
    try {
      const result = await generatePresentation({
        topic: topic.trim(),
        author: author.trim(),
        language: (presentationLanguage as 'uz' | 'ru' | 'en') || 'uz',
        subject: selectedProTemplate,
        variant: selectedProTemplateVariant,
        document_format: proDocumentFormat,
        bibliography_text: proBibliographyType === 'manual' ? proBibliographyText : undefined,
        send_to_telegram: true,
        images: imageMode === 'manual' && imageFiles.length > 0 ? imageFiles : undefined,
      });

      setActiveJobId(result.id);
      setActiveServiceName('Taqdimot');
      if (user?.id) {
        localStorage.setItem('orzu:job:' + user.id, result.id);
      }
      refreshCommerce();

      showAlert("✅ Taqdimot yaratish boshlandi! Claude Haiku matn yozmoqda, Seedream esa rasmlarni tayyorlamoqda. Tayyor bo'lgach Telegram botingizga ham yuboriladi.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showAlert(`Xatolik: ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  const root = isDark
    ? 'min-h-screen bg-slate-900 text-slate-50'
    : 'min-h-screen bg-slate-100 text-slate-900';
  const card = isDark
    ? 'bg-slate-800 border border-slate-700'
    : 'bg-white border border-slate-200';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm opacity-70">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center px-6">
          <p className="text-red-400 text-sm">{authError}</p>
          <p className="text-xs opacity-50 mt-2">Iltimos, Telegram orqali oching</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${root} flex flex-col justify-center items-center py-6 px-4 pb-24`}>
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Main Card */}
        <div className={`w-full rounded-3xl shadow-xl ${card} flex flex-col min-h-[460px]`}>
          <Header
            language={language}
            setLanguage={setLanguage}
            isDark={isDark}
            setIsDark={setIsDark}
            balance={balance}
            referralCredits={referralCredits}
            onOpenReferral={() => setIsReferralModalOpen(true)}
          />

          {/* Active Job Tracker Banner */}
          {activeJobId && (
            <div className="px-5 pt-1 pb-2">
              <div className="relative">
                <JobProgressCard
                  jobId={activeJobId}
                  serviceName={activeServiceName}
                  isDark={isDark}
                  onFinished={refreshCommerce}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (user?.id) localStorage.removeItem('orzu:job:' + user.id);
                    setActiveJobId(null);
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
                  title="Yopish"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STANDARD TAB ── */}
          {currentPage === 'standard' && (
            <>
              {!selectedStandardService ? (
                <StandardMenu 
                  isDark={isDark} 
                  onSelectService={(id) => {
                    if (id === 'taqdimot') {
                      setCurrentPage('pro');
                      setSelectedStandardService(null);
                    } else {
                      setSelectedStandardService(id);
                    }
                  }} 
                />
              ) : (
                <div className="flex-1 flex flex-col relative h-full">
                  <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedStandardService(null)} 
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      ← Orqaga
                    </button>
                    <h3 className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {selectedStandardService === 'maqola' ? 'Maqola Yaratish' : selectedStandardService === 'obyektivka' ? 'Obyektivka Yaratish' : 'Xizmat'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      BEPUL
                    </span>
                  </div>
                  
                  {selectedStandardService === 'maqola' ? (
                    <ArticleForm 
                      isDark={isDark} 
                      balance={balance} 
                      isAdmin={user?.role === 'admin'} 
                      onJobStarted={(jobId) => {
                        setActiveJobId(jobId);
                        setActiveServiceName('Ilmiy Maqola');
                        if (user?.id) localStorage.setItem('orzu:job:' + user.id, jobId);
                        refreshCommerce();
                      }}
                    />
                  ) : selectedStandardService === 'obyektivka' ? (
                    <ObyektivkaForm isDark={isDark} balance={balance} isAdmin={user?.role === 'admin'} />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ animation: 'dFadeIn 0.3s ease-out' }}>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tez kunda!</h3>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ushbu xizmat turi ayni paytda tayyorlanmoqda. Tez orada Telegram botimiz orqali taqdim etiladi!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── PRESENTATION (PRO) TAB ── */}
          {currentPage === 'pro' && (
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-5 flex flex-col gap-4">
              {/* Topic */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {t.topicLabel}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Masalan: Raqamli iqtisodiyot va sun'iy intellekt..."
                  className={`w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500/70 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
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
                  placeholder="F.I.SH kiriting..."
                  className={`w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500/70 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                />
              </div>

              {/* Language Selection */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70 block mb-1">
                  Taqdimot tilini tanlang
                </label>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`w-full px-3 py-2.5 rounded-2xl border text-sm outline-none transition-all flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-700 text-slate-50' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {{ uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' }[presentationLanguage] || '🇺🇿'}
                    </span>
                    <span className="font-semibold text-xs">
                      {{ uz: "O'zbek", ru: 'Русский', en: 'English' }[presentationLanguage] || "O'zbek"}
                    </span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform opacity-60 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLangOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-full rounded-2xl border z-50 overflow-hidden shadow-2xl origin-top ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="max-h-48 overflow-y-auto w-full py-1">
                      {(['uz', 'ru', 'en'] as Language[]).map((lng) => {
                        const flags: Record<string, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
                        const names: Record<string, string> = { uz: "O'zbek", ru: 'Русский', en: 'English' };
                        return (
                          <button
                            key={lng}
                            type="button"
                            onClick={() => { setPresentationLanguage(lng); setIsLangOpen(false); }}
                            className={`w-full px-4 py-2.5 text-xs flex items-center gap-3 transition-colors ${
                              presentationLanguage === lng 
                                ? (isDark ? 'bg-slate-700/50 text-cyan-400 font-bold' : 'bg-slate-100 text-indigo-600 font-bold')
                                : (isDark ? 'text-slate-300 hover:bg-slate-700/30' : 'text-slate-700 hover:bg-slate-50')
                            }`}
                          >
                            <span className="text-xl">{flags[lng]}</span>
                            <span className={`${presentationLanguage === lng ? 'font-bold' : 'font-medium'}`}>{names[lng]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Academic Pack Info Card */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-sm transition-all ${
                isDark ? 'bg-cyan-950/30 border-cyan-700/40 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💎</span>
                  <div>
                    <p className="font-bold text-xs">20 slaydli to'liq akademik paket</p>
                    <p className="text-[10px] opacity-75">4 ta reja bandi va 3 tagacha Seedream 5.0 AI rasm</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  1 kvota
                </span>
              </div>

              {/* Template selector inside Pro */}
              <div className="mt-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {t.designLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsProTemplateModalOpen(true)}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Barcha shablonlar ({proTemplates.length})</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Active Selected Template Preview Card */}
                {(() => {
                  const curTemplate = proTemplates.find(t => t.id === selectedProTemplate) || proTemplates[0];
                  const curVariant = curTemplate?.variants.find(v => v.variant === selectedProTemplateVariant) || curTemplate?.variants[0];
                  return (
                    <div 
                      onClick={() => setIsProTemplateModalOpen(true)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isDark ? 'bg-slate-800/80 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-white border-cyan-400/50 hover:border-cyan-500 shadow-sm'
                      }`}
                    >
                      {curVariant?.image && (
                        <div className="w-16 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700/50 bg-slate-950">
                          <img 
                            src={curVariant.image} 
                            alt={curVariant.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{curTemplate?.icon || '📁'}</span>
                          <h4 className="text-xs font-bold truncate">
                            {curTemplate?.name || 'Standart'}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            #{selectedProTemplateVariant}-variant
                          </span>
                        </div>
                        <p className="text-[10.5px] opacity-75 truncate mt-0.5">
                          {curVariant?.title || curTemplate?.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pr-1">
                        <span className="text-[11px] font-bold text-cyan-400 block">
                          Ko'rish
                        </span>
                        <span className="text-[9px] opacity-60">
                          {curTemplate?.variants.length ?? 1} ta variant
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Horizontal Folder Carousel */}
                <div className="overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                  <div className="grid grid-flow-col grid-rows-2 gap-2.5 w-max">
                    {proTemplates.map(template => {
                      const isSelected = selectedProTemplate === template.id;
                      return (
                        <button 
                          key={template.id} 
                          type="button" 
                          onClick={() => {
                            setSelectedProTemplate(template.id);
                            setSelectedProTemplateVariant(1);
                            setIsProTemplateModalOpen(true);
                          }}
                          className="relative w-[135px] h-[70px] flex-shrink-0 group text-left"
                        >
                          {/* Folder tab */}
                          <div className={`absolute top-0 left-0 w-[42px] h-[11px] rounded-t-lg border-t-2 border-l-2 border-r-2 border-b-0 transition-colors z-0 ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : (isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white')}`}></div>
                          
                          {/* Folder body */}
                          <div className={`absolute top-[9px] left-0 right-0 bottom-0 rounded-xl rounded-tl-none border-2 z-10 flex flex-col justify-center px-2.5 py-1.5 transition-all ${isSelected ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]' : (isDark ? 'border-slate-700 bg-slate-800 text-slate-300 group-hover:border-slate-600' : 'border-slate-300 bg-white text-slate-700 group-hover:border-slate-400')}`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{template.icon}</span>
                              <span className="text-xs font-semibold truncate leading-tight">{template.name}</span>
                            </div>
                            <span className="text-[9.5px] opacity-60 font-normal mt-0.5">
                              {template.variants.length} ta dizayn
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Full Pro Template Modal */}
              <ProTemplateModal
                isOpen={isProTemplateModalOpen}
                onClose={() => setIsProTemplateModalOpen(false)}
                isDark={isDark}
                selectedSubjectId={selectedProTemplate}
                selectedVariant={selectedProTemplateVariant}
                onSelect={(subId, variant) => {
                  setSelectedProTemplate(subId);
                  setSelectedProTemplateVariant(variant);
                }}
              />

              {/* Image Mode */}
              <div className="space-y-2 mt-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {t.imageLabel}
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setImageMode('ai')}
                    className={`w-full px-3 py-2 rounded-2xl text-xs font-semibold border text-left transition-colors ${imageMode === 'ai' ? (isDark ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-900 text-slate-50 border-slate-800') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700')}`}
                  >
                    🎨 ByteDance Seedream 5.0 AI (3 tagacha professional rasm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('manual')}
                    className={`w-full px-3 py-2 rounded-2xl text-xs font-semibold border text-left transition-colors ${imageMode === 'manual' ? (isDark ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-cyan-600 text-white border-cyan-500') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700')}`}
                  >
                    📸 {t.imageModeManual} (ko'pi bilan 3 ta, har biri 5 MB gacha)
                  </button>
                  {imageMode === 'manual' && (
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 rounded-2xl text-xs font-semibold bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600 transition-colors">
                        Rasm tanlash
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs opacity-70 truncate">
                        {imageNames.length > 0
                          ? `${imageNames.length} ta rasm tanlandi`
                          : t.imagePlaceholder}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bibliography Mode */}
              <div className="space-y-2 mt-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {t.bibliographyLabel}
                </label>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProBibliographyType('none')}
                      className={`flex-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors ${proBibliographyType === 'none' ? (isDark ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-900 text-slate-50 border-slate-800') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700')}`}
                    >
                      {t.biblioNone}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProBibliographyType('ai')}
                      className={`flex-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors ${proBibliographyType === 'ai' ? (isDark ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-900 text-slate-50 border-slate-800') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700')}`}
                    >
                      {t.biblioAI}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProBibliographyType('manual')}
                      className={`flex-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors ${proBibliographyType === 'manual' ? (isDark ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-900 text-slate-50 border-slate-800') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700')}`}
                    >
                      {t.biblioManual}
                    </button>
                  </div>
                  {proBibliographyType === 'manual' && (
                    <textarea
                      value={proBibliographyText}
                      onChange={(e) => setProBibliographyText(e.target.value)}
                      rows={2}
                      placeholder="Adabiyotlarni kiriting..."
                      className={`w-full mt-1 px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500/70 resize-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                    />
                  )}
                </div>
              </div>

              {/* Document Format Mode */}
              <div className="space-y-2 mt-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {t.formatLabel}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProDocumentFormat('ppt')}
                    className={`flex-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${proDocumentFormat === 'ppt' ? (isDark ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-cyan-600 text-white border-cyan-500') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100')}`}
                  >
                    PowerPoint (PPTX)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProDocumentFormat('pdf')}
                    className={`flex-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${proDocumentFormat === 'pdf' ? (isDark ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-cyan-600 text-white border-cyan-500') : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100')}`}
                  >
                    PDF Hujjati
                  </button>
                </div>
              </div>

              {/* Price Note */}
              <div className="flex justify-between items-center text-[10px] mt-1 px-1">
                <span className="opacity-70">
                  Xizmat narxi: <strong className="text-cyan-400">1 kvota</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(true)}
                  className={`font-bold flex items-center gap-1 ${referralCredits < 1 && user?.role !== 'admin' ? 'text-amber-400 underline' : 'text-emerald-400'}`}
                >
                  <span>Mavjud: {referralCredits} kvota</span>
                  <span>+</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="mt-2 w-full px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 active:scale-[0.99] transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {generating ? '⏳ Yaratilmoqda...' : '✨ TAQDIMOT YARATISH (1 KVOTA)'}
              </button>
            </div>
          )}

          {/* ── DESIGN TAB ── */}
          {currentPage === 'design' && (
            <DesignForm
              isDark={isDark}
              balance={balance}
              referralCredits={referralCredits}
              isAdmin={user?.role === 'admin'}
              onOpenReferral={() => setIsReferralModalOpen(true)}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <div 
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-full flex justify-between items-center p-2 shadow-xl z-50 transition-all ${
            isDark ? 'bg-[#161c2d]/95 backdrop-blur-md border border-slate-700/50' : 'bg-white/95 backdrop-blur-md border border-slate-200'
          }`}
        >
          <button 
            onClick={() => setCurrentPage('standard')}
            className={`flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 active:scale-95 ${
              currentPage === 'standard' 
                ? 'bg-[#00c2cb] text-white font-bold shadow-md shadow-[#00c2cb]/40' 
                : (isDark ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-800 font-medium')
            }`}
          >
            <Home size={18} className={currentPage === 'standard' ? 'text-white' : ''} />
            <span>Standart</span>
          </button>

          <button 
            onClick={() => setCurrentPage('pro')}
            className={`flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 active:scale-95 ${
              currentPage === 'pro' 
                ? 'bg-[#00c2cb] text-white font-bold shadow-md shadow-[#00c2cb]/40' 
                : (isDark ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-800 font-medium')
            }`}
          >
            <Star size={18} fill={currentPage === 'pro' ? 'currentColor' : 'none'} className={currentPage === 'pro' ? 'text-white' : ''} />
            <span>Taqdimot</span>
          </button>

          <button 
            onClick={() => setCurrentPage('design')}
            className={`flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 active:scale-95 ${
              currentPage === 'design' 
                ? 'bg-[#00c2cb] text-white font-bold shadow-md shadow-[#00c2cb]/40' 
                : (isDark ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-800 font-medium')
            }`}
          >
            <Palette size={18} className={currentPage === 'design' ? 'text-white' : ''} />
            <span>Dizayn</span>
          </button>
        </div>

        {/* Referral & Quota Modal */}
        <ReferralModal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          isDark={isDark}
          account={commerce}
        />
      </div>
    </div>
  );
};

export default App;
