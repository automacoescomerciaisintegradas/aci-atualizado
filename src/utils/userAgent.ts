/**
 * Utilitários para detecção de User Agent
 */

/**
 * Detecta tipo de dispositivo baseado no User Agent
 */
export function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const ua = userAgent.toLowerCase();

    // Tablets
    if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
        return 'tablet';
    }

    // Mobile
    if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|opera mobi|iemobile|windows phone/i.test(ua)) {
        return 'mobile';
    }

    return 'desktop';
}

/**
 * Detecta navegador baseado no User Agent
 */
export function detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
    if (ua.includes('trident/') || ua.includes('msie')) return 'IE';

    return 'Unknown';
}

/**
 * Detecta sistema operacional baseado no User Agent
 */
export function detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('windows nt 10')) return 'Windows 10';
    if (ua.includes('windows nt 11') || (ua.includes('windows nt 10') && ua.includes('win64'))) return 'Windows 11';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os x')) return 'macOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    if (ua.includes('linux')) return 'Linux';

    return 'Unknown';
}

/**
 * Extrai informações completas do User Agent
 */
export function parseUserAgent(userAgent: string) {
    return {
        deviceType: detectDeviceType(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOS(userAgent),
    };
}
