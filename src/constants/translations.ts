import { Language } from './templates';

export const translations: Record<
    Language,
    {
        title: string;
        balanceLabel: string;
        currency: string;
        topicLabel: string;
        topicDescriptionLabel: string;
        authorLabel: string;
        slideCountLabel: string;
        planCountLabel: string;
        imageLabel: string;
        imageModeAI: string;
        imageModeManual: string;
        bibliographyLabel: string;
        biblioNone: string;
        biblioAI: string;
        biblioManual: string;
        formatLabel: string;
        imagePlaceholder: string;
        aiWarning: string;
        generate: string;
        designLabel: string;
        priceLabel: string;
        insufficientBalance: string;
        langNames: Record<Language, string>;
    }
> = {
    uz: {
        title: 'AI taqdimot mini app',
        balanceLabel: 'Balans',
        currency: "so'm",
        topicLabel: 'Taqdimot mavzusi',
        topicDescriptionLabel: 'Mavzu tavsifi',
        authorLabel: 'Taqdimot tayyorlovchi (ism familiya)',
        slideCountLabel: 'Sahifa soni',
        planCountLabel: 'Rejalar soni',
        imageLabel: 'Rasm yuklash',
        imageModeAI: 'Rasmni AI generatsiya qilsin',
        imageModeManual: "Rasmni o'zim yuklayman",
        bibliographyLabel: "Foydalanilgan adabiyotlar",
        biblioNone: "Yo'q",
        biblioAI: "AI tavsiyasi bilan",
        biblioManual: "O'zim kiritaman",
        formatLabel: "Hujjatni qaysi shaklda qabul qilib olasiz?",
        imagePlaceholder: 'Rasm tanlanmagan',
        aiWarning: "AI mukammal emas, u ham xato qilishi mumkin. Yakuniy taqdimotni albatta ko'rib chiqing.",
        generate: 'Taqdimot yaratish',
        designLabel: 'Dizayn shablonini tanlang',
        priceLabel: 'Taqdimot narxi',
        insufficientBalance: "Balansingiz yetarli emas, iltimos to'ldiring.",
        langNames: { uz: 'UZ', en: 'EN', ru: 'RU' },
    },
    en: {
        title: 'AI presentation mini app',
        balanceLabel: 'Balance',
        currency: 'UZS',
        topicLabel: 'Presentation topic',
        topicDescriptionLabel: 'Topic description',
        authorLabel: 'Presenter name',
        slideCountLabel: 'Slide count',
        planCountLabel: 'Plan count',
        imageLabel: 'Upload image',
        imageModeAI: 'Let AI generate images',
        imageModeManual: 'I will upload images',
        bibliographyLabel: "Bibliography",
        biblioNone: "None",
        biblioAI: "With AI recommendation",
        biblioManual: "I will enter manually",
        formatLabel: "In what format do you want to receive the document?",
        imagePlaceholder: 'No image selected',
        aiWarning: 'AI is not perfect and can be wrong. Always review the final presentation.',
        generate: 'Generate presentation',
        designLabel: 'Select design template',
        priceLabel: 'Presentation price',
        insufficientBalance: 'Insufficient balance, please top up.',
        langNames: { uz: 'UZ', en: 'EN', ru: 'RU' },
    },
    ru: {
        title: 'AI презентация мини-приложение',
        balanceLabel: 'Баланс',
        currency: 'сум',
        topicLabel: 'Тема презентации',
        topicDescriptionLabel: 'Описание темы',
        authorLabel: 'Подготовил (ФИО)',
        slideCountLabel: 'Количество слайдов',
        planCountLabel: 'Количество планов',
        imageLabel: 'Загрузка изображения',
        imageModeAI: 'Изображения генерирует ИИ',
        imageModeManual: 'Я загружу изображения',
        bibliographyLabel: "Список литературы",
        biblioNone: "Нет",
        biblioAI: "С рекомендацией ИИ",
        biblioManual: "Введу вручную",
        formatLabel: "В каком формате вы хотите получить документ?",
        imagePlaceholder: 'Изображение не выбрано',
        aiWarning: 'ИИ не идеален и может ошибаться. Обязательно проверяйте итоговую презентацию.',
        generate: 'Создать презентацию',
        designLabel: 'Выберите шаблон дизайна',
        priceLabel: 'Цена презентации',
        insufficientBalance: 'Недостаточно средств, пожалуйста, пополните баланс.',
        langNames: { uz: 'UZ', en: 'EN', ru: 'RU' },
    }
};
