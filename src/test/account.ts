import type { CommerceAccount, CommerceQuote } from '../api/client';
export function account(remaining: number, credits = 0): CommerceAccount {
    const quote = (required: number): CommerceQuote => ({allowed:credits>=required,amount:0,source:required?'referral':'free',required_credits:required,available_credits:credits,missing_credits:Math.max(0,required-credits),reason:credits<required?'insufficient_referral_credits':null});
    const standard = () => quote(remaining>0 ? 0 : 1);
    return {access_mode:'referral_only',standard_trial_enabled:true,standard_free_remaining:remaining,standard_free_limit:3,standard_free_used:3-remaining,
        referral_credits:credits,confirmed_referrals:credits,course_credits:Math.floor(credits/2),bot_username:'Yordamchi_taalaba_bot',referral_link:'https://t.me/Yordamchi_taalaba_bot?start=ref_99',policy:'Jami 3 ta bepul, keyin1kvota.',
        quotes:{presentation:quote(1),course:quote(2),design:quote(1),article:standard(),referat:standard(),obyektivka:standard()}};
}
