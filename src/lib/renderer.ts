import type { EmailData, Alignment } from '../types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function alignStyle(a: Alignment) {
  return `text-align:${a};`;
}

function renderSocialLinks(data: EmailData): string {
  const active = data.socialLinks.filter(s => s.enabled && s.url);
  if (!data.socialEnabled || !active.length) return '';

  const links = active.map(s =>
    `<a href="${s.url}" style="display:inline-block;margin:0 5px;padding:8px 16px;border:1px solid #D4D4D4;border-radius:9999px;color:#525252;text-decoration:none;font-size:13px;font-weight:500;font-family:Inter,-apple-system,sans-serif;">${s.label}</a>`
  ).join('');

  return `<div style="padding:20px 0 4px;${alignStyle(data.socialAlignment)}">${links}</div>`;
}

export function renderPreviewHTML(data: EmailData): string {
  const logoAlign = data.logoAlignment ?? 'left';
  const logoMarginLeft = logoAlign === 'center' ? 'auto' : logoAlign === 'right' ? 'auto' : '0';
  const logoMarginRight = logoAlign === 'center' ? 'auto' : logoAlign === 'right' ? '0' : 'auto';
  const logoSize = data.logoSize ?? 52;
  const logoHtml = data.logoBase64
    ? `<img src="${data.logoBase64}" style="height:${logoSize}px;display:block;margin-bottom:24px;margin-left:${logoMarginLeft};margin-right:${logoMarginRight};" alt="ShopOS">`
    : `<div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;${logoAlign === 'center' ? 'margin-left:auto;margin-right:auto;' : ''}">
        <div style="width:32px;height:32px;background:#ffffff;border-radius:6px;display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0A0A0A"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="#0A0A0A"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0A0A0A"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0A0A0A" opacity="0.3"/></svg>
        </div>
        <span style="color:#ffffff;font-size:16px;font-weight:600;font-family:Inter,-apple-system,sans-serif;">ShopOS</span>
      </div>`;

  const paragraphsHtml = data.bodyParagraphs
    .filter(p => p.html.trim())
    .map(p => `<p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;line-height:1.7;font-family:Inter,-apple-system,sans-serif;${alignStyle(p.align)}">${p.html}</p>`)
    .join('');

  const calloutHtml = data.calloutEnabled && (data.calloutTitle || data.calloutBody)
    ? `<div style="background:#f7f7f7;border-radius:${data.calloutBorderRadius ?? 8}px;padding:16px 20px;margin:0 0 24px;">
        ${data.calloutTitle ? `<p style="margin:0 0 4px;color:#1a1a1a;font-size:14px;font-weight:600;font-family:Inter,-apple-system,sans-serif;">${esc(data.calloutTitle)}</p>` : ''}
        ${data.calloutBody ? `<p style="margin:0;color:#444444;font-size:14px;line-height:1.6;font-family:Inter,-apple-system,sans-serif;">${esc(data.calloutBody)}</p>` : ''}
      </div>`
    : '';

  const radius = data.ctaBorderRadius;
  const ctaHtml = `<table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;${data.ctaAlignment === 'center' ? 'margin-left:auto;margin-right:auto;' : ''}">
    <tr>
      <td style="background:${data.ctaBg};border-radius:${radius}px;">
        <a href="${data.ctaUrl || '#'}" style="display:inline-block;background:${data.ctaBg};color:${data.ctaTextColor};text-decoration:none;border-radius:${radius}px;padding:14px 28px;font-size:15px;font-weight:500;font-family:Inter,-apple-system,sans-serif;">${esc(data.ctaLabel || 'Click here')}</a>
      </td>
    </tr>
  </table>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>* { box-sizing: border-box; } body { margin: 0; padding: 0; background: ${data.heroBg}; -webkit-font-smoothing: antialiased; } a { color: #0A0A0A; }</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${data.heroBg};">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
    <!-- Hero -->
    <tr>
      <td style="padding:40px 24px 32px;background:${data.heroBg};">
        ${logoHtml}
        <h1 style="margin:0 0 12px;padding:0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;font-family:Inter,-apple-system,sans-serif;${alignStyle(data.heroAlignment)}">${esc(data.heroHeadline || 'Your headline here.')}</h1>
        <p style="margin:0;padding:0;color:#888888;font-size:16px;line-height:1.5;font-family:Inter,-apple-system,sans-serif;${alignStyle(data.heroAlignment)}">${esc(data.heroSubheading || 'Supporting context goes here.')}</p>
      </td>
    </tr>
    <!-- Body Card -->
    <tr>
      <td style="padding:0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${data.cardBg};border-radius:${data.cardBorderRadius ?? 12}px;">
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;line-height:1.7;font-family:Inter,-apple-system,sans-serif;">${esc(data.greeting || 'Hey')},</p>
              ${paragraphsHtml || '<p style="margin:0 0 16px;color:#cccccc;font-size:16px;font-family:Inter,-apple-system,sans-serif;font-style:italic;">Your copy goes here...</p>'}
              ${calloutHtml}
              ${ctaHtml}
              ${renderSocialLinks(data)}
              <div style="border-top:1px solid #f0f0f0;padding-top:20px;margin-top:8px;">
                <p style="margin:0;color:#1a1a1a;font-size:15px;font-weight:500;font-family:Inter,-apple-system,sans-serif;">${esc(data.senderName)}</p>
                <p style="margin:2px 0 0;color:#888888;font-size:15px;font-family:Inter,-apple-system,sans-serif;">${esc(data.senderTitle)}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:24px 24px 40px;text-align:center;">
        <p style="margin:0;color:#555555;font-size:12px;line-height:1.6;font-family:Inter,-apple-system,sans-serif;">${esc(data.footerNote)}</p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
