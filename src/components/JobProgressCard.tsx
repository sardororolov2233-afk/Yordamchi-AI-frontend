import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { getJobStatus, downloadJob, JobStatus } from '../api/client';

interface JobProgressCardProps {
    jobId: string;
    onFinished: () => void;
    isDark: boolean;
    serviceName?: string;
}

export const JobProgressCard: React.FC<JobProgressCardProps> = ({
    jobId,
    onFinished,
    isDark,
    serviceName,
}) => {
    const [statusData, setStatusData] = useState<JobStatus | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        let isCancelled = false;
        setStatusData(null);
        setStep(1);
        let polling = false;

        const interval = setInterval(async () => {
            if (polling) return;
            polling = true;

            try {
                const data = await getJobStatus(jobId);
                if (isCancelled) return;
                setStatusData(data);
                setStep(data.status === 'queued' ? 1 : data.status === 'completed' ? 3 : 2);

                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(interval);
                    onFinished();
                }
            } catch (err) {
                console.error('[JobPoll error]', err);
            } finally {
                polling = false;
            }
        }, 1500);

        return () => {
            isCancelled = true;
            clearInterval(interval);
        };
    }, [jobId, onFinished]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadJob(jobId);
        } catch (err: any) {
            alert(err.message || 'Yuklab olishda xatolik');
        } finally {
            setDownloading(false);
        }
    };

    const isDone = statusData?.status === 'completed';
    const isFailed = statusData?.status === 'failed';

    return (
        <div className={`p-4 rounded-3xl border shadow-xl transition-all relative overflow-hidden ${
            isDark 
                ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-cyan-500/30' 
                : 'bg-gradient-to-br from-white via-cyan-50/40 to-white border-cyan-300 shadow-cyan-500/10'
        }`}>
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDone 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : isFailed 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                    }`}>
                        {isDone ? (
                            <CheckCircle2 size={18} />
                        ) : isFailed ? (
                            <AlertCircle size={18} />
                        ) : (
                            <Loader2 size={18} className="animate-spin" />
                        )}
                    </div>
                    <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                            <span>{serviceName || 'Buyurtma'}</span>
                            <span className="text-[10px] opacity-60">#{jobId.slice(0, 8)}</span>
                        </h4>
                        <p className="text-[10px] opacity-70">
                            {isDone 
                                ? 'Muvaffaqiyatli yakunlandi!' 
                                : isFailed 
                                ? 'Bajarilmadi' 
                                : statusData?.status === 'queued' ? 'Buyurtma navbatda...' : 'Buyurtma tayyorlanmoqda...'}
                        </p>
                    </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isDone 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : isFailed 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                }`}>
                    {statusData?.status || 'queued'}
                </span>
            </div>

            {/* Stepper when in progress */}
            {!isDone && !isFailed && (
                <div className="space-y-2 my-2">
                    <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse transition-all duration-500 w-3/4" />
                    </div>
                    <div className="flex justify-between text-[9.5px] opacity-70 font-medium px-1">
                        <span className={step >= 1 ? 'text-cyan-400 font-bold' : ''}>1. So‘rov qabul qilindi</span>
                        <span className={step >= 2 ? 'text-cyan-400 font-bold' : ''}>2. Tayyorlanmoqda</span>
                        <span className={step >= 3 ? 'text-cyan-400 font-bold' : ''}>3. Yakunlash</span>
                    </div>
                </div>
            )}

            {/* Completed state */}
            {isDone && (
                <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <Send size={14} />
                        <span>{statusData?.telegram_sent ? 'Fayl Telegram botingizga ham yuborildi!' : 'Fayl tayyor. Quyidagi tugma orqali yuklab oling.'}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        {downloading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Download size={15} />
                        )}
                        <span>{downloading ? 'Yuklanmoqda...' : 'Faylni to‘g‘ridan-to‘g‘ri yuklab olish'}</span>
                    </button>
                </div>
            )}

            {/* Failed state */}
            {isFailed && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 mt-2">
                    {statusData?.message || 'Ish yakunlanmadi. Band qilingan kvota qaytarildi.'}
                </div>
            )}
        </div>
    );
};
