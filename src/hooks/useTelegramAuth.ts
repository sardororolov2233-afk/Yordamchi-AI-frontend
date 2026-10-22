import { useState, useEffect } from 'react';
import { telegramLogin, getMyProfile, devLogin } from '../api/client';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name: string | null;
    username: string | null;
    balance: number;
    role: string;
    is_premium: boolean;
    language_code: string | null;
}

// Vite DEV flag — any cast bilan TypeScript muammosidan qochamiz
const IS_DEV = (import.meta as any).env?.DEV === true;

export function useTelegramAuth() {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            try {
                // Mavjud tokenni tekshirish
                const existingToken = localStorage.getItem('access_token');

                if (existingToken) {
                    try {
                        const profile = await getMyProfile();
                        setUser(profile);
                        setLoading(false);
                        return;
                    } catch {
                        // Token eskirgan — tozalab qayta login qilamiz
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                    }
                }

                // Telegram WebApp mavjudmi?
                const tg = (window as any).Telegram?.WebApp;

                // DEV LOGS FOR DEBUGGING ON MOBILE:
                if (tg) {
                    // Alert orqali telegram web app datalarini ekranga chiqaramiz
                    // console.log ko'rinmaydi mobil qurilmada
                    if (!tg.initData) {
                        setError(`Telegram ma'lumot berolmadi (initData yo'q). Balki BotFather orqali inline tugma noto'g'ri sozlangan?`);
                        setLoading(false);
                        return;
                    }
                }

                if (!tg || !tg.initData) {
                    if (IS_DEV) {
                        // Development mode — backend /auth/dev-login orqali real token olamiz
                        console.warn('[Auth] Development mode: /auth/dev-login ishlatilmoqda');
                        try {
                            const data = await devLogin();
                            localStorage.setItem('access_token', data.access_token);
                            setUser({
                                ...data.user,
                                language_code: (data.user as any).language_code ?? 'uz',
                            });
                            setLoading(false);
                            return;
                        } catch {
                            // dev-login ishlamasa — mock user bilan davom etamiz
                        }
                        // Fallback: token yo'q bo'lsa ham mock user
                        setUser({
                            id: 123456789,
                            first_name: 'Test',
                            last_name: 'User',
                            username: 'testuser',
                            balance: 50000,
                            role: 'user',
                            is_premium: false,
                            language_code: 'uz',
                        });
                        setLoading(false);
                        return;
                    }
                    setError(`Qurilma Telegram emasmikin? tg object: ${Boolean(tg)}, initData: ${Boolean(tg?.initData)}`);
                    setLoading(false);
                    return;
                }

                tg.ready();
                tg.expand();

                // Backend: initData → JWT token
                try {
                    const authData = await telegramLogin(tg.initData);
                    localStorage.setItem('access_token', authData.access_token);

                    // To'liq profil
                    const profile = await getMyProfile();
                    setUser(profile);
                } catch (apiErr: any) {
                    setError(`Backend xatoligi: ${apiErr.message || apiErr}`);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Login xatoligi';
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return { user, loading, error, logout };
}
