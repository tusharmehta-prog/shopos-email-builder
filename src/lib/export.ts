import JSZip from 'jszip';
import type { EmailData, Alignment } from '../types';

function escXml(s: string): string {
  return s.replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'email';
}

function addUTMParams(url: string, subjectLine: string): string {
  if (!url || url === '#') return url || '#';
  const campaign = toSlug(subjectLine);
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=loops&utm_medium=email&utm_campaign=${campaign}`;
}

function mjmlAlign(a: Alignment) {
  return a;
}

export function generateMJML(data: EmailData): string {
  const logoMJML = data.logoBase64
    ? `<mj-image src="${data.logoBase64}" width="${(data.logoSize ?? 52) * 2}px" alt="ShopOS" padding="0 0 24px 0" align="${data.logoAlignment ?? 'left'}" />`
    : '';

  const paragraphsMJML = data.bodyParagraphs
    .filter(p => p.html.trim())
    .map(p => `        <mj-text color="#1a1a1a" font-size="${p.fontSize ?? 16}px" line-height="1.7" padding="0 0 16px 0" align="${mjmlAlign(p.align)}">${p.html}</mj-text>`)
    .join('\n');

  const calloutMJML = data.calloutEnabled && (data.calloutTitle || data.calloutBody)
    ? `
    <!-- Callout Block -->
    <mj-section background-color="#f7f7f7" border-radius="${data.calloutBorderRadius ?? 8}px" padding="16px 20px">
      <mj-column>
        ${data.calloutTitle ? `<mj-text color="#1a1a1a" font-size="14px" font-weight="600" padding="0 0 4px 0">${escXml(data.calloutTitle)}</mj-text>` : ''}
        ${data.calloutBody ? `<mj-text color="#444444" font-size="14px" line-height="1.6" padding="0">${escXml(data.calloutBody)}</mj-text>` : ''}
      </mj-column>
    </mj-section>` : '';

  const MJML_SOCIAL_ICONS: Record<string, string> = {
    twitter:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    linkedin:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    instagram: `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    facebook:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    tiktok:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.56V6.88a4.85 4.85 0 01-1.06-.19z"/></svg>`,
  };
  const activeSocial = data.socialLinks.filter(s => s.enabled);
  const socialMJML = data.socialEnabled && activeSocial.length
    ? `
        <!-- Social Icons -->
        <mj-text padding="16px 0 8px" align="${data.socialAlignment}">
          ${activeSocial.map(s =>
            `<a href="${s.url || '#'}" style="display:inline-flex;width:36px;height:36px;align-items:center;justify-content:center;background:#1a1a1a;border-radius:50%;margin:0 4px;text-decoration:none;vertical-align:middle;">${MJML_SOCIAL_ICONS[s.platform] || ''}</a>`
          ).join('')}
        </mj-text>`
    : '';

  const ctaUrl = addUTMParams(data.ctaUrl, data.subjectLine);
  const radius = data.ctaBorderRadius;

  return `<mjml>
  <mj-head>
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
    <mj-attributes>
      <mj-all font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" />
    </mj-attributes>
    <mj-preview>${escXml(data.previewText)}</mj-preview>
    <mj-title>${escXml(data.subjectLine)}</mj-title>
  </mj-head>
  <mj-body background-color="${data.heroBg}">

    <!-- Hero -->
    <mj-section background-color="${data.heroBg}" padding="40px 24px 32px">
      <mj-column>
        ${logoMJML}
        <mj-text color="#ffffff" font-size="28px" font-weight="600" line-height="1.3" padding="0 0 12px 0" align="${data.heroAlignment}">${escXml(data.heroHeadline)}</mj-text>
        <mj-text color="#888888" font-size="16px" line-height="1.5" padding="0" align="${data.heroAlignment}">${escXml(data.heroSubheading)}</mj-text>
      </mj-column>
    </mj-section>

    <!-- Body Card -->
    <mj-section background-color="${data.cardBg}" border-radius="${data.cardBorderRadius ?? 12}px" padding="0 24px">
      <mj-column background-color="${data.cardBg}" border-radius="${data.cardBorderRadius ?? 12}px" padding="32px 32px 24px">
        <mj-text color="#1a1a1a" font-size="16px" line-height="1.7" padding="0 0 16px 0">${escXml(data.greeting)},</mj-text>
${paragraphsMJML}
${calloutMJML}
        <mj-button background-color="${data.ctaBg}" color="${data.ctaTextColor}" font-size="15px" font-weight="500" border-radius="${radius}px" inner-padding="14px 28px" padding="8px 0 24px" align="${data.ctaAlignment}" href="${ctaUrl}">${escXml(data.ctaLabel)}</mj-button>
        <mj-divider border-color="#f0f0f0" border-width="1px" padding="0 0 20px 0" />
        <mj-text color="#1a1a1a" font-size="15px" font-weight="500" padding="0 0 2px 0">${escXml(data.senderName)}</mj-text>
        <mj-text color="#888888" font-size="15px" padding="0">${escXml(data.senderTitle)}</mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="${data.heroBg}" padding="24px 24px 40px">
      <mj-column>
${socialMJML}
        <mj-text color="#555555" font-size="12px" line-height="1.6" align="center">${escXml(data.footerNote)}</mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>`;
}

export async function exportZip(data: EmailData): Promise<void> {
  const mjml = generateMJML(data);
  const slug = toSlug(data.subjectLine);
  const zip = new JSZip();
  zip.file('index.mjml', mjml);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyMJML(data: EmailData): void {
  navigator.clipboard.writeText(generateMJML(data));
}
