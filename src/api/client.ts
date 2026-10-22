// src/api/client.ts
export const BASE = (import.meta as any).env?.VITE_API_BASE ||
    (window.location.origin.includes('localhost') ? 'http://127.0.0.1:8000/api/v1' : 'https://telegram-ai-presentation.onrender.com/api/v1');

export function getBackendOrigin(): string {
    try {
        return new URL(BASE).origin;
    } catch {
        return window.location.origin;
    }
}

export function toAbsoluteBackendUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    const origin = getBackendOrigin();
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getToken(): string | null {
    return localStorage.getItem('access_token');
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Bypass-Tunnel-Reminder': 'true',
        ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.reload();
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Xatolik yuz berdi');
    }

    return res.json();
}

// ── Auth ────────────────────────────────────────────────────
export async function telegramLogin(initData: string) {
    return request<{
        access_token: string;
        token_type: string;
        user: {
            id: number;
            first_name: string;
            last_name: string | null;
            username: string | null;
            balance: number;
            role: string;
            is_premium: boolean;
        };
    }>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ init_data: initData }),
    });
}

export async function devLogin() {
    return request<{
        access_token: string;
        token_type: string;
        user: {
            id: number;
            first_name: string;
            last_name: string | null;
            username: string | null;
            balance: number;
            role: string;
            is_premium: boolean;
        };
    }>('/auth/dev-login', {
        method: 'POST',
    });
}

// ── Users ───────────────────────────────────────────────────
export async function getMyProfile() {
    return request<{
        id: number;
        first_name: string;
        last_name: string | null;
        username: string | null;
        language_code: string | null;
        balance: number;
        role: string;
        is_premium: boolean;
        is_active: boolean;
    }>('/users/me');
}

export async function updateMyProfile(data: {
    first_name?: string;
    last_name?: string;
    language_code?: string;
}) {
    return request<{
        id: number;
        first_name: string;
        last_name: string | null;
        username: string | null;
        language_code: string | null;
        balance: number;
        role: string;
        is_premium: boolean;
        is_active: boolean;
    }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

// ── Commerce & Referral Quota ───────────────────────────────
export interface CommerceQuote {
    allowed: boolean;
    amount: number;
    source: 'referral' | 'free';
    required_credits: number;
    available_credits: number;
    missing_credits: number;
    reason: string | null;
}

export interface CommerceAccount {
    access_mode: string;
    referral_credits: number;
    confirmed_referrals: number;
    course_credits: number;
    referral_presentations?: number;
    bot_username: string;
    referral_link: string;
    policy: string;
    quotes: {
        presentation: CommerceQuote;
        course: CommerceQuote;
        referat: CommerceQuote;
        article: CommerceQuote;
        design: CommerceQuote;
        obyektivka: CommerceQuote;
    };
}

export async function getAccountCommerce(): Promise<CommerceAccount> {
    return request<CommerceAccount>('/commerce');
}

// ── Jobs API (Asynchronous Durable Orders) ───────────────────
export interface JobStatus {
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    service: string;
    telegram_sent: boolean;
    slide_count?: number;
    message?: string | null;
    download_url?: string | null;
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
    return request<JobStatus>(`/jobs/${jobId}`);
}

export async function downloadJob(jobId: string, defaultFilename?: string): Promise<void> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}/jobs/${jobId}/download`, { headers });
    if (!res.ok) {
        throw new Error('Faylni olishda xatolik yuz berdi');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disp = res.headers.get('Content-Disposition') || '';
    const match = disp.match(/filename="?([^";]+)"?/);
    a.download = match?.[1] || defaultFilename || `hujjat_${jobId}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
}

// ── Presentations ───────────────────────────────────────────
export interface ProTemplateVariant {
    variant: number;
    name: string;
    slide_count: number;
    plan_count: number;
    size_bytes: number;
    image_count: number;
}

export interface ProTemplateSubject {
    subject: string;
    label: string;
    variants: ProTemplateVariant[];
}

export async function getProTemplates() {
    return request<{ subjects: ProTemplateSubject[] }>('/presentations/templates');
}

export interface PresentationRequest {
    topic: string;
    author?: string;
    language?: 'uz' | 'ru' | 'en';
    subject?: string;
    variant?: number;
    document_format?: 'ppt' | 'pdf';
    bibliography_text?: string;
    send_to_telegram?: boolean;
    images?: File[];
    idempotencyKey?: string;

    // Backward compatibility props
    slide_count?: number;
    style?: string;
    extra_context?: string;
    design_template?: number;
    is_pro?: boolean;
    is_2slides?: boolean;
    pro_plan_count?: number;
    pro_bibliography_type?: string;
    pro_bibliography_text?: string;
    pro_design?: string;
    pro_design_variant?: number;
}

export interface PresentationResponse {
    id: string;
    status: string;
    telegram_sent: boolean;
    slide_count: number;
}

export async function generatePresentation(data: PresentationRequest): Promise<PresentationResponse> {
    const formData = new FormData();
    formData.append('topic', data.topic.trim());
    if (data.author) formData.append('author', data.author.trim());
    formData.append('language', (data.language || 'uz') as string);
    
    // Resolve subject & variant
    const resolvedSubject = data.subject || data.pro_design || 'minimalizm';
    const resolvedVariant = data.variant || data.pro_design_variant || 1;
    formData.append('subject', resolvedSubject);
    formData.append('variant', String(resolvedVariant));

    formData.append('document_format', data.document_format || 'ppt');
    
    const biblio = data.bibliography_text || data.pro_bibliography_text;
    if (biblio) {
        formData.append('bibliography_text', biblio);
    }
    
    formData.append('send_to_telegram', String(data.send_to_telegram ?? true));

    // Images limit: max 3 images (max 5 MB each)
    if (data.images && data.images.length > 0) {
        data.images.slice(0, 3).forEach((file) => {
            formData.append('images', file);
        });
    }

    const idempotencyKey = data.idempotencyKey || generateUUID();

    return request<PresentationResponse>('/presentations/generate', {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
        body: formData,
    });
}

// ── Design Generation ───────────────────────────────────────
export interface DesignRequest {
    description: string;
    format: string;
    style: string;
    lang: string;
    send_to_telegram?: boolean;
    idempotencyKey?: string;
}

export interface DesignResponse {
    id: string;
    telegram_sent: boolean;
    images: string[];
}

export async function generateDesign(data: DesignRequest): Promise<DesignResponse> {
    const idempotencyKey = data.idempotencyKey || generateUUID();
    return request<DesignResponse>('/designs/generate', {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
            description: data.description.trim(),
            format: data.format,
            style: data.style,
            lang: data.lang,
            send_to_telegram: data.send_to_telegram ?? true,
        }),
    });
}

// ── Article Generation ───────────────────────────────────────
export interface ArticleRequest {
    topic: string;
    author: string;
    language: 'uz' | 'ru' | 'en';
    references?: string;
    send_to_telegram?: boolean;
    idempotencyKey?: string;
}

export interface ArticleResponse {
    id: string;
    status: string;
    telegram_sent: boolean;
}

export async function generateArticle(data: ArticleRequest): Promise<ArticleResponse> {
    const formData = new FormData();
    formData.append('topic', data.topic.trim());
    formData.append('author', data.author.trim());
    formData.append('language', data.language || 'uz');
    if (data.references) {
        formData.append('references', data.references);
    }
    formData.append('send_to_telegram', String(data.send_to_telegram ?? true));

    const idempotencyKey = data.idempotencyKey || generateUUID();

    return request<ArticleResponse>('/articles/generate', {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
        body: formData,
    });
}

// ── Obyektivka Generation ───────────────────────────────────────
export interface RelativeItem {
    id: string;
    relationship: string;
    fullName: string;
    birthYearPlace: string;
    workplacePosition: string;
    livingAddress: string;
}

export interface WorkItem {
    id: string;
    period: string;
    description: string;
}

export interface ObyektivkaRequest {
    fullName: string;
    currentPosition: string;
    birthDate: string;
    birthPlace: string;
    livingAddress: string;
    nationality: string;
    party: string;
    educationLevel: string;
    university: string;
    educationForm: string;
    specialty: string;
    academicDegree: string;
    academicTitle: string;
    qualificationLevel: string;
    phone: string;
    email: string;
    languages: string[];
    awards: string;
    deputy: string;
    workHistory: WorkItem[];
    relatives: RelativeItem[];
    photoFile?: File | null;
}

export interface ObyektivkaResponse {
    id?: string;
    telegram_sent?: boolean;
    docx_url?: string;
    file_url?: string;
    message?: string;
}

export async function generateObyektivka(data: ObyektivkaRequest): Promise<ObyektivkaResponse> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Bypass-Tunnel-Reminder': 'true',
        'Idempotency-Key': generateUUID(),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('full_name', data.fullName);
    formData.append('current_position', data.currentPosition);
    formData.append('birth_date', data.birthDate);
    formData.append('birth_place', data.birthPlace);
    formData.append('living_address', data.livingAddress);
    formData.append('nationality', data.nationality);
    formData.append('party', data.party);
    formData.append('education_level', data.educationLevel);
    formData.append('university', data.university);
    formData.append('education_form', data.educationForm);
    formData.append('specialty', data.specialty);
    formData.append('academic_degree', data.academicDegree);
    formData.append('academic_title', data.academicTitle);
    formData.append('qualification_level', data.qualificationLevel);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('languages', JSON.stringify(data.languages));
    formData.append('awards', data.awards);
    formData.append('deputy', data.deputy);
    formData.append('work_history', JSON.stringify(data.workHistory));
    formData.append('relatives', JSON.stringify(data.relatives));

    formData.append('data', JSON.stringify({
        fullName: data.fullName,
        currentPosition: data.currentPosition,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        livingAddress: data.livingAddress,
        nationality: data.nationality,
        party: data.party,
        educationLevel: data.educationLevel,
        university: data.university,
        educationForm: data.educationForm,
        specialty: data.specialty,
        academicDegree: data.academicDegree,
        academicTitle: data.academicTitle,
        qualificationLevel: data.qualificationLevel,
        phone: data.phone,
        email: data.email,
        languages: data.languages,
        awards: data.awards,
        deputy: data.deputy,
        workHistory: data.workHistory,
        relatives: data.relatives,
    }));

    if (data.photoFile) {
        formData.append('photo', data.photoFile);
    }

    const res = await fetch(`${BASE}/obyektivka/generate`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.reload();
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Obyektivka yaratishda xatolik yuz berdi');
    }

    const contentType = res.headers.get('content-type') || '';
    if (
        contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/msword')
    ) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `${data.fullName.trim() ? data.fullName.trim().replace(/\s+/g, '_') : 'Obyektivka'}_malumotnoma.docx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { telegram_sent: false, message: 'DOCX fayli yuklab olindi!' };
    }

    const json = await res.json().catch(() => ({}));
    if (json.docx_url || json.file_url) {
        const rawUrl = json.docx_url || json.file_url;
        const downloadUrl = toAbsoluteBackendUrl(rawUrl);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${data.fullName.trim() ? data.fullName.trim().replace(/\s+/g, '_') : 'Obyektivka'}_malumotnoma.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return json;
}
