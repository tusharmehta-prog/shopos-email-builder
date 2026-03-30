export type TemplateType = 'transactional' | 'announcement' | 'lifecycle';
export type ViewportMode = 'desktop' | 'mobile';
export type Alignment = 'left' | 'center' | 'right';

export interface BodyParagraph {
  id: string;
  html: string;       // can contain <a>, <strong>, <em>
  align: Alignment;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok';
  label: string;
  url: string;
  enabled: boolean;
}

export interface EmailData {
  template: TemplateType;
  logoBase64: string | null;

  // Header
  subjectLine: string;
  previewText: string;

  // Hero
  heroHeadline: string;
  heroSubheading: string;
  heroAlignment: 'left' | 'center';

  // Body
  greeting: string;
  bodyParagraphs: BodyParagraph[];
  calloutEnabled: boolean;
  calloutTitle: string;
  calloutBody: string;
  ctaLabel: string;
  ctaUrl: string;
  ctaAlignment: 'left' | 'center';

  // Footer
  senderName: string;
  senderTitle: string;
  footerNote: string;
  socialEnabled: boolean;
  socialAlignment: Alignment;
  socialLinks: SocialLink[];

  // Logo
  logoAlignment: Alignment;
  logoSize: number;          // height in px

  // Styles
  heroBg: string;
  ctaBg: string;
  ctaTextColor: string;
  ctaBorderRadius: number;
  cardBg: string;
  cardBorderRadius: number;
  calloutBorderRadius: number;
}
