const defaultWhatsappUrl = 'https://wa.me/6283896895536';

export const defaultWhatsappMessage =
  'Halo Kodeye, saya ingin konsultasi tentang AI automation, web development, DevOps, infrastructure, atau code audit.';

export function whatsappUrl(message = defaultWhatsappMessage) {
  const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || defaultWhatsappUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';

  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`;
}
