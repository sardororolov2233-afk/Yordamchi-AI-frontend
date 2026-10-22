import type { CommerceAccount } from '../api/client';

export type StandardService = 'article' | 'referat' | 'obyektivka';

/** Preview only; the backend reserves the shared allowance atomically. */
export function standardAllowance(account: CommerceAccount | null, service: StandardService) {
    const quote = account?.quotes?.[service];
    const ready = account?.standard_trial_enabled === true && !!quote;
    const freeRemaining = Math.max(0, Math.min(3, account?.standard_free_remaining ?? 0));
    const requiredCredits = ready ? quote.required_credits : null;
    return {
        ready,
        allowed: ready && quote.allowed,
        requiredCredits,
        freeRemaining,
        label: !ready ? 'Hisob yuklanmoqda' : requiredCredits === 0 ? 'Bepul limitdan' : `${requiredCredits} kvota`,
        note: !ready
            ? 'Limitni tekshirish uchun hisob yuklanishi kerak.'
            : `Referat, maqola va obyektivka uchun jami 3 ta bepul foydalanish. Qoldi: ${freeRemaining}/3. Keyingi har biri — 1 kvota.`,
    };
}
