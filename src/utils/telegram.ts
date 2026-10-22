export const showAlert = (message: string) => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
};
