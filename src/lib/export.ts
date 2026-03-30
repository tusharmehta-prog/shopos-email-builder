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
    .map(p => `        <mj-text color="#1a1a1a" font-size="16px" line-height="1.7" padding="0 0 16px 0" align="${mjmlAlign(p.align)}">${p.html}</mj-text>`)
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

  const activeSocial = data.socialLinks.filter(s => s.enabled && s.url);
  const socialMJML = data.socialEnabled && activeSocial.length
    ? `
        <!-- Social Links -->
        <mj-text padding="20px 0 4px" align="${data.socialAlignment}">
          ${activeSocial.map(s =>
            `<a href="${s.url}" style="display:inline-block;margin:0 5px;padding:8px 16px;border:1px solid #D4D4D4;border-radius:9999px;color:#525252;text-decoration:none;font-size:13px;font-weight:500;">${s.label}</a>`
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
${socialMJML}
        <mj-divider border-color="#f0f0f0" border-width="1px" padding="0 0 20px 0" />
        <mj-text color="#1a1a1a" font-size="15px" font-weight="500" padding="0 0 2px 0">${escXml(data.senderName)}</mj-text>
        <mj-text color="#888888" font-size="15px" padding="0">${escXml(data.senderTitle)}</mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="${data.heroBg}" padding="24px 24px 40px">
      <mj-column>
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
