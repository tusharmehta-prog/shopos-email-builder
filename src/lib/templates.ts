import type { EmailData, TemplateType, SocialLink } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_SOCIAL: SocialLink[] = [
  { platform: 'twitter', label: 'Twitter', url: '', enabled: false },
  { platform: 'linkedin', label: 'LinkedIn', url: '', enabled: false },
  { platform: 'instagram', label: 'Instagram', url: '', enabled: false },
];

const DEFAULT_STYLES = {
  heroBg: '#0A0A0A',
  cardBg: '#FFFFFF',
  cardBorderRadius: 12,
  calloutBorderRadius: 8,
  ctaBg: '#0A0A0A',
  ctaTextColor: '#FFFFFF',
  ctaBorderRadius: 8,
  logoAlignment: 'left' as const,
  logoSize: 52,
};

const BASE: Omit<EmailData, 'template' | 'subjectLine' | 'previewText' | 'heroHeadline' | 'heroSubheading' | 'bodyParagraphs' | 'calloutEnabled' | 'calloutTitle' | 'calloutBody' | 'ctaLabel' | 'ctaUrl'> = {
  logoBase64: null,
  heroAlignment: 'left',
  greeting: 'Hey',
  ctaAlignment: 'left',
  senderName: 'Sai',
  senderTitle: 'Co-founder, ShopOS',
  footerNote: "You're receiving this because you have an active ShopOS account. {unsubscribe_link}",
  socialEnabled: false,
  socialAlignment: 'center',
  socialLinks: DEFAULT_SOCIAL,
  ...DEFAULT_STYLES,
};

export const TEMPLATE_DEFAULTS: Record<TemplateType, EmailData> = {
  transactional: {
    ...BASE,
    template: 'transactional',
    subjectLine: 'your plan has been renewed',
    previewText: "Receipt inside, plus what's next for your store.",
    heroHeadline: 'Your plan just renewed.',
    heroSubheading: "Here's what happened and what comes next.",
    bodyParagraphs: [
      { id: uid(), html: 'Your ShopOS Pro plan renewed on [date] for $[amount]. Your receipt is attached.', align: 'left' },
      { id: uid(), html: "Your credits reset to [X] for the new cycle. They're ready to use.", align: 'left' },
    ],
    calloutEnabled: false,
    calloutTitle: '',
    calloutBody: '',
    ctaLabel: 'View your dashboard',
    ctaUrl: 'https://app.shopos.ai',
  },
  announcement: {
    ...BASE,
    template: 'announcement',
    subjectLine: 'nothing changes for you',
    previewText: "A quick note on what's new — and what isn't.",
    heroHeadline: "Something's changing. Not for you.",
    heroSubheading: "A note on what's new and why we did it.",
    bodyParagraphs: [
      { id: uid(), html: "We're updating how ShopOS pricing works for new signups. Existing customers keep exactly what they have.", align: 'left' },
      { id: uid(), html: "Here's what changes: [explain change]. Here's what stays the same: your plan, your credits, your integrations.", align: 'left' },
    ],
    calloutEnabled: true,
    calloutTitle: 'Your plan stays the same.',
    calloutBody: 'Nothing about your current plan changes. This only affects new signups going forward.',
    ctaLabel: 'Read the full announcement',
    ctaUrl: 'https://shopos.ai/blog',
  },
  lifecycle: {
    ...BASE,
    template: 'lifecycle',
    subjectLine: 'welcome to shopos',
    previewText: "Your store is live. Here's where to start.",
    heroHeadline: "You're in.",
    heroSubheading: "Your ShopOS account is ready. Let's build something.",
    bodyParagraphs: [
      { id: uid(), html: 'Welcome to ShopOS. You now have [X] credits to run your first automations.', align: 'left' },
      { id: uid(), html: "Not sure where to start? Your dashboard shows you exactly what to do next.", align: 'left' },
    ],
    calloutEnabled: false,
    calloutTitle: '',
    calloutBody: '',
    ctaLabel: 'Open your dashboard',
    ctaUrl: 'https://app.shopos.ai',
  },
};

export const DEFAULT_EMAIL_DATA: EmailData = TEMPLATE_DEFAULTS.transactional;
