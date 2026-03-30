import { useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Download, Copy, Check, FileText, ClipboardCheck } from 'lucide-react';
import type { EmailData, ViewportMode } from '../types';
import { renderPreviewHTML } from '../lib/renderer';
import { exportZip, copyMJML } from '../lib/export';

interface Props {
  data: EmailData;
  viewportMode: ViewportMode;
  onViewportChange: (m: ViewportMode) => void;
}

type ActiveView = 'email' | 'plaintext' | 'preflight';

function toPlainText(data: EmailData): string {
  const strip = (h: string) => h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
  const paragraphs = data.bodyParagraphs.map(p => strip(p.html)).filter(Boolean).join('\n\n');
  const callout = data.calloutEnabled && (data.calloutTitle || data.calloutBody)
    ? `\n\n---\n${data.calloutTitle}\n${data.calloutBody}\n---` : '';
  return [
    `Subject: ${data.subjectLine}`,
    `Preview: ${data.previewText}`,
    '',
    `${data.greeting},`,
    '',
    paragraphs,
    callout,
    '',
    data.ctaLabel ? `→ ${data.ctaLabel}: ${data.ctaUrl}` : '',
    '',
    data.senderName,
    data.senderTitle,
    '',
    data.footerNote,
  ].join('\n');
}

function PreflightPanel({ data }: { data: EmailData }) {
  const items = [
    { label: 'Subject line written', pass: data.subjectLine.trim().length > 0 },
    { label: 'Subject ≤60 chars', pass: data.subjectLine.length > 0 && data.subjectLine.length <= 60, warn: data.subjectLine.length > 60 },
    { label: 'Preview text set', pass: data.previewText.trim().length > 0 },
    { label: 'Hero headline written', pass: data.heroHeadline.trim().length > 0 },
    { label: 'Body copy added', pass: data.bodyParagraphs.some(p => p.html.replace(/<[^>]+>/g, '').trim().length > 0) },
    { label: 'CTA label set', pass: data.ctaLabel.trim().length > 0 },
    { label: 'CTA URL is valid', pass: data.ctaUrl.startsWith('http') },
    { label: 'Sender name set', pass: data.senderName.trim().length > 0 },
    { label: '{unsubscribe_link} in footer', pass: data.footerNote.includes('{unsubscribe_link}') },
  ];
  const passing = items.filter(i => i.pass).length;
  const pct = Math.round((passing / items.length) * 100);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#FAFAFA', padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 480 }}>
        {/* Score */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>Preflight checklist</span>
            <span style={{ fontSize: 13, color: '#737373' }}>{passing}/{items.length}</span>
          </div>
          <div style={{ height: 4, background: '#E5E5E5', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16A34A' : '#0A0A0A', borderRadius: 9999, transition: 'width 400ms ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => {
            const state = item.pass ? 'pass' : (item.warn ? 'warn' : 'fail');
            const colors = { pass: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A', text: '#15803D' }, warn: { bg: '#FFF7ED', border: '#FED7AA', icon: '#EA580C', text: '#C2410C' }, fail: { bg: '#FAFAFA', border: '#E5E5E5', icon: '#D4D4D4', text: '#525252' } };
            const c = colors[state];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: c.bg, border: `1px solid ${c.border}` }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.icon }}>
                  <span style={{ color: '#FFF', fontSize: 10, fontWeight: 800 }}>{state === 'pass' ? '✓' : state === 'warn' ? '!' : '✗'}</span>
                </div>
                <span style={{ fontSize: 13, color: c.text, fontWeight: state === 'fail' ? 500 : 400 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Preview({ data, viewportMode, onViewportChange }: Props) {
  const [debouncedData, setDebouncedData] = useState(data);
  const [copiedMJML, setCopiedMJML] = useState(false);
  const [copiedHTML, setCopiedHTML] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('email');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedData(data), 300);
    return () => clearTimeout(timerRef.current);
  }, [data]);

  const html = renderPreviewHTML(debouncedData);
  const previewWidth = viewportMode === 'mobile' ? 375 : 600;

  const handleExport = async () => {
    setExporting(true);
    try { await exportZip(data); } finally { setExporting(false); }
  };

  const handleCopyMJML = () => { copyMJML(data); setCopiedMJML(true); setTimeout(() => setCopiedMJML(false), 2000); };
  const handleCopyHTML = () => { navigator.clipboard.writeText(renderPreviewHTML(data)); setCopiedHTML(true); setTimeout(() => setCopiedHTML(false), 2000); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Row 1: Inbox mockup (white, only on email tab) */}
      {activeView === 'email' && (
        <div style={{
          background: '#FFFFFF', borderBottom: '1px solid #E5E5E5',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#FFF', fontSize: 12, fontWeight: 700 }}>
              {(debouncedData.senderName[0] || 'S').toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>{debouncedData.senderName || 'ShopOS'}</span>
              <span style={{ fontSize: 11, color: '#A3A3A3' }}>&lt;hi@shopos.ai&gt;</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>{debouncedData.subjectLine || '(no subject)'}</span>
              <span style={{ fontSize: 11, color: '#A3A3A3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{debouncedData.previewText}</span>
            </div>
          </div>
          {/* Viewport toggle inline */}
          <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 9999, padding: 2, gap: 1 }}>
            {(['desktop', 'mobile'] as ViewportMode[]).map(m => (
              <button
                key={m}
                onClick={() => onViewportChange(m)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 24, borderRadius: 9999, border: 'none',
                  background: viewportMode === m ? '#FFFFFF' : 'transparent',
                  color: viewportMode === m ? '#000' : '#A3A3A3',
                  cursor: 'pointer', transition: 'all 150ms ease',
                  boxShadow: viewportMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
                title={m === 'desktop' ? 'Desktop' : 'Mobile'}
              >
                {m === 'desktop' ? <Monitor size={12} /> : <Smartphone size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Row 2: Tab bar + actions */}
      <div style={{
        height: 44, background: '#FFFFFF', borderBottom: '1px solid #E5E5E5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0,
      }}>
        {/* View tabs */}
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 9999, padding: 2, gap: 1 }}>
          {([
            { id: 'email' as ActiveView, label: 'Preview', icon: <Monitor size={11} /> },
            { id: 'plaintext' as ActiveView, label: 'Plain text', icon: <FileText size={11} /> },
            { id: 'preflight' as ActiveView, label: 'Preflight', icon: <ClipboardCheck size={11} /> },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 11px', borderRadius: 9999, border: 'none',
                background: activeView === tab.id ? '#FFFFFF' : 'transparent',
                color: activeView === tab.id ? '#000' : '#737373',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: activeView === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[
            { label: copiedHTML ? 'Copied!' : 'HTML', icon: copiedHTML ? <Check size={10} /> : <Copy size={10} />, onClick: handleCopyHTML, green: copiedHTML },
            { label: copiedMJML ? 'Copied!' : 'MJML', icon: copiedMJML ? <Check size={10} /> : <Copy size={10} />, onClick: handleCopyMJML, green: copiedMJML },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                height: 28, padding: '0 11px', borderRadius: 9999,
                border: '1px solid #E5E5E5', background: '#FFFFFF',
                color: btn.green ? '#16A34A' : '#525252',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 150ms', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!btn.green) { e.currentTarget.style.borderColor = '#A3A3A3'; e.currentTarget.style.color = '#000'; } }}
              onMouseLeave={e => { if (!btn.green) { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#525252'; } }}
            >
              {btn.icon}{btn.label}
            </button>
          ))}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              height: 28, padding: '0 14px', borderRadius: 9999,
              border: 'none', background: exporting ? '#F5F5F5' : '#000',
              color: exporting ? '#A3A3A3' : '#FFF',
              fontSize: 11, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
              transition: 'all 150ms', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!exporting) e.currentTarget.style.background = '#1A1A1A'; }}
            onMouseLeave={e => { if (!exporting) e.currentTarget.style.background = '#000'; }}
          >
            <Download size={10} />
            {exporting ? 'Exporting...' : 'Download zip'}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'preflight' ? (
        <PreflightPanel data={debouncedData} />
      ) : activeView === 'plaintext' ? (
        <div style={{ flex: 1, overflow: 'auto', background: '#FAFAFA', padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 520, background: '#FFFFFF', border: '1px solid #E5E5E5',
            borderRadius: 8, padding: '32px',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 13, color: '#1a1a1a', lineHeight: 1.8,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {toPlainText(debouncedData)}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '32px 24px', background: '#FAFAFA' }}>
          <div style={{
            width: previewWidth, transition: 'width 0.2s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 0 0 1px #E5E5E5',
            borderRadius: 8, overflow: 'hidden', background: '#0A0A0A',
          }}>
            <iframe
              srcDoc={html}
              title="Email preview"
              style={{ width: '100%', border: 'none', display: 'block' }}
              height={900}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
