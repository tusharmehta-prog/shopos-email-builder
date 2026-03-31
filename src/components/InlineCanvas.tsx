import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Bold, Italic, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Hash, Trash2 } from 'lucide-react';
import type { EmailData, Alignment, LoopsContactProperty } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);
const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 24, 28, 32];

const SOCIAL_ICONS: Record<string, string> = {
  twitter:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  linkedin:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  instagram: `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  facebook:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  tiktok:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.56V6.88a4.85 4.85 0 01-1.06-.19z"/></svg>`,
};

interface Props {
  data: EmailData;
  onChange: <K extends keyof EmailData>(key: K, value: EmailData[K]) => void;
  contactProperties: LoopsContactProperty[];
}

// ─── Simple plain-text editable ───────────────────────────────────────────────
function SimpleEditable({
  value, onChange, style, placeholder, multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    if (ref.current && !focused.current) {
      if (ref.current.innerText !== value) ref.current.innerText = value || '';
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; }}
      onInput={() => { if (ref.current) onChange(ref.current.innerText); }}
      onKeyDown={multiline ? undefined : (e) => { if (e.key === 'Enter') e.preventDefault(); }}
      style={{ outline: 'none', cursor: 'text', minHeight: '1em', ...style }}
    />
  );
}

// ─── Canvas paragraph (rich editing, light theme) ────────────────────────────
function CanvasParagraph({
  id, html, align, fontSize, placeholder, canRemove, contactProperties,
  onChange, onAlignChange, onFontSizeChange, onRemove,
}: {
  id: string; html: string; align: Alignment; fontSize: number;
  placeholder: string; canRemove: boolean; contactProperties: LoopsContactProperty[];
  onChange: (html: string) => void; onAlignChange: (a: Alignment) => void;
  onFontSizeChange: (size: number) => void; onRemove: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showMergeTags, setShowMergeTags] = useState(false);
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreRange = useCallback(() => {
    if (savedRange.current) {
      ref.current?.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange.current);
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    restoreRange();
    document.execCommand(cmd, false, val || undefined);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleLinkInsert = () => {
    if (!linkUrl.trim()) { setShowLink(false); return; }
    restoreRange();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand('createLink', false, linkUrl);
    } else {
      document.execCommand('insertHTML', false, `<a href="${linkUrl}" style="color:#0A0A0A;text-decoration:underline;">link</a>`);
    }
    if (ref.current) onChange(ref.current.innerHTML);
    setShowLink(false);
    setLinkUrl('');
  };

  const insertMergeTag = (prop: LoopsContactProperty) => {
    restoreRange();
    document.execCommand('insertText', false, `{{${prop.key}}}`);
    if (ref.current) onChange(ref.current.innerHTML);
    setShowMergeTags(false);
  };

  const btn = (active = false): React.CSSProperties => ({
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, border: 'none', background: active ? '#E5E5E5' : 'transparent',
    color: active ? '#000' : '#737373', cursor: 'pointer', padding: 0,
    transition: 'all 120ms ease',
  });

  const divider = <div style={{ width: 1, height: 14, background: '#E5E5E5', margin: '0 2px' }} />;

  return (
    <div style={{ position: 'relative' }}>
      {focused && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1, padding: '3px 5px',
          background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', marginBottom: 4, flexWrap: 'wrap',
          position: 'sticky', top: 8, zIndex: 10,
        }}>
          <select
            value={fontSize}
            onChange={e => onFontSizeChange(Number(e.target.value))}
            onMouseDown={e => e.stopPropagation()}
            style={{
              height: 22, padding: '0 4px', background: '#F5F5F5', border: '1px solid #E5E5E5',
              borderRadius: 4, color: '#000', fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          {divider}
          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Bold"><Bold size={12} /></button>
          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Italic"><Italic size={12} /></button>
          <button style={btn(showLink)} onMouseDown={e => { e.preventDefault(); saveRange(); setShowLink(v => !v); setShowMergeTags(false); setLinkUrl(''); }} title="Insert link"><LinkIcon size={12} /></button>
          {divider}
          {(['left', 'center', 'right'] as Alignment[]).map(a => (
            <button key={a} style={btn(align === a)} onMouseDown={e => { e.preventDefault(); onAlignChange(a); }} title={`Align ${a}`}>
              {a === 'left' ? <AlignLeft size={12} /> : a === 'center' ? <AlignCenter size={12} /> : <AlignRight size={12} />}
            </button>
          ))}
          {divider}
          <button style={btn(showMergeTags)} onMouseDown={e => { e.preventDefault(); saveRange(); setShowMergeTags(v => !v); setShowLink(false); }} title="Insert variable"><Hash size={12} /></button>
          {canRemove && (
            <>{divider}<button style={btn()} onMouseDown={e => { e.preventDefault(); onRemove(); }} title="Remove paragraph"><Trash2 size={11} color="#DC2626" /></button></>
          )}
        </div>
      )}

      {focused && showMergeTags && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 8,
          marginBottom: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: 200, overflowY: 'auto', zIndex: 10, position: 'relative',
        }}>
          <div style={{ padding: '6px 10px 4px', fontSize: 10, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, borderBottom: '1px solid #F5F5F5' }}>
            Contact properties
          </div>
          {contactProperties.map(prop => (
            <button
              key={prop.key}
              onMouseDown={e => { e.preventDefault(); insertMergeTag(prop); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '7px 10px', border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 12, color: '#1a1a1a' }}>{prop.label}</span>
              <span style={{ fontSize: 11, color: '#A3A3A3', fontFamily: 'monospace' }}>{`{{${prop.key}}}`}</span>
            </button>
          ))}
        </div>
      )}

      {focused && showLink && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '7px 10px', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10, position: 'relative' }}>
          <LinkIcon size={11} color="#A3A3A3" />
          <input
            autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLinkInsert(); if (e.key === 'Escape') setShowLink(false); }}
            placeholder="https://..."
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#1a1a1a', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <button onClick={handleLinkInsert} style={{ height: 22, padding: '0 10px', borderRadius: 9999, border: 'none', background: '#0A0A0A', color: '#FFF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Insert</button>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={e => {
          const related = e.relatedTarget as HTMLElement | null;
          if (!related || !e.currentTarget.parentElement?.contains(related)) {
            setTimeout(() => setFocused(false), 150);
          }
        }}
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
        onMouseUp={saveRange}
        onKeyUp={saveRange}
        style={{
          minHeight: 32,
          padding: '4px 6px', margin: '-4px -6px',
          fontSize: `${fontSize}px`, color: '#1a1a1a',
          fontFamily: 'Inter, -apple-system, sans-serif', lineHeight: '1.7',
          background: 'transparent', outline: 'none', textAlign: align,
          borderRadius: 6,
          boxShadow: focused ? 'inset 0 0 0 1.5px rgba(0,0,0,0.15)' : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 150ms ease',
        }}
      />
      <style>{`[data-placeholder]:empty:before { content: attr(data-placeholder); color: #D4D4D4; pointer-events: none; }`}</style>
    </div>
  );
}

// ─── Main canvas ──────────────────────────────────────────────────────────────
export function InlineCanvas({ data, onChange, contactProperties }: Props) {
  const updateParagraph = (id: string, field: 'html' | 'align' | 'fontSize', value: string | number) => {
    onChange('bodyParagraphs', data.bodyParagraphs.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addParagraph = () => {
    onChange('bodyParagraphs', [...data.bodyParagraphs, { id: uid(), html: '', align: 'left' as Alignment }]);
  };

  const removeParagraph = (id: string) => {
    if (data.bodyParagraphs.length <= 1) return;
    onChange('bodyParagraphs', data.bodyParagraphs.filter(p => p.id !== id));
  };

  const logoAlign = data.logoAlignment ?? 'left';
  const logoSize = data.logoSize ?? 52;

  const activeSocial = data.socialLinks.filter(s => s.enabled);

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', background: data.heroBg }}>
      <style>{`
        [data-field]:not(:focus-within):hover { outline: 1.5px dashed rgba(255,255,255,0.15); outline-offset: 3px; border-radius: 4px; }
        [data-field-light]:not(:focus-within):hover { outline: 1.5px dashed rgba(0,0,0,0.12); outline-offset: 3px; border-radius: 4px; }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ padding: '40px 24px 32px', background: data.heroBg }}>
        {/* Logo */}
        {data.logoBase64 ? (
          <div style={{ textAlign: logoAlign, marginBottom: 24 }}>
            <img
              src={data.logoBase64}
              style={{ height: logoSize, display: 'inline-block' }}
              alt="ShopOS"
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: logoAlign === 'center' ? 'center' : logoAlign === 'right' ? 'flex-end' : 'flex-start' }}>
            <div style={{ width: 32, height: 32, background: '#ffffff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0A0A0A"/>
                <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#0A0A0A"/>
                <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0A0A0A"/>
                <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0A0A0A" opacity="0.3"/>
              </svg>
            </div>
            <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>ShopOS</span>
          </div>
        )}

        {/* Headline */}
        <div data-field style={{ marginBottom: 12, textAlign: data.heroAlignment }}>
          <SimpleEditable
            value={data.heroHeadline}
            onChange={v => onChange('heroHeadline', v)}
            placeholder="Your headline here."
            style={{ color: '#ffffff', fontSize: 28, fontWeight: 600, lineHeight: 1.3, display: 'inline-block', width: '100%' }}
          />
        </div>

        {/* Subheading */}
        <div data-field style={{ textAlign: data.heroAlignment }}>
          <SimpleEditable
            value={data.heroSubheading}
            onChange={v => onChange('heroSubheading', v)}
            placeholder="Supporting context goes here."
            style={{ color: '#888888', fontSize: 16, lineHeight: 1.5, display: 'inline-block', width: '100%' }}
          />
        </div>
      </div>

      {/* ── Body card ── */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ background: data.cardBg, borderRadius: data.cardBorderRadius ?? 12, padding: '32px 32px 24px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <div data-field-light style={{ flex: 1 }}>
              <SimpleEditable
                value={data.greeting}
                onChange={v => onChange('greeting', v)}
                placeholder="Hey"
                style={{ color: '#1a1a1a', fontSize: 16, lineHeight: 1.7, display: 'inline' }}
              />
            </div>
            <span style={{ color: '#1a1a1a', fontSize: 16, lineHeight: 1.7, marginLeft: 1 }}>,</span>
          </div>

          {/* Body paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
            {data.bodyParagraphs.map((p, i) => (
              <CanvasParagraph
                key={p.id}
                id={p.id}
                html={p.html}
                align={p.align}
                fontSize={p.fontSize ?? 16}
                placeholder={`Paragraph ${i + 1}…`}
                canRemove={data.bodyParagraphs.length > 1}
                contactProperties={contactProperties}
                onChange={html => updateParagraph(p.id, 'html', html)}
                onAlignChange={a => updateParagraph(p.id, 'align', a)}
                onFontSizeChange={size => updateParagraph(p.id, 'fontSize', size)}
                onRemove={() => removeParagraph(p.id)}
              />
            ))}
          </div>

          <button
            onClick={addParagraph}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              width: '100%', height: 28, borderRadius: 6, marginBottom: 16, marginTop: 8,
              border: '1px dashed #E5E5E5', background: 'transparent',
              color: '#C4C4C4', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 150ms', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#A3A3A3'; e.currentTarget.style.color = '#737373'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#C4C4C4'; }}
          >
            <Plus size={10} /> Add paragraph
          </button>

          {/* Callout */}
          {data.calloutEnabled && (
            <div style={{ background: '#f7f7f7', borderRadius: data.calloutBorderRadius ?? 8, padding: '16px 20px', marginBottom: 24 }}>
              <div data-field-light style={{ marginBottom: 4 }}>
                <SimpleEditable
                  value={data.calloutTitle}
                  onChange={v => onChange('calloutTitle', v)}
                  placeholder="Callout title…"
                  style={{ color: '#1a1a1a', fontSize: 14, fontWeight: 600 }}
                />
              </div>
              <div data-field-light>
                <SimpleEditable
                  value={data.calloutBody}
                  onChange={v => onChange('calloutBody', v)}
                  placeholder="Callout body…"
                  multiline
                  style={{ color: '#444444', fontSize: 14, lineHeight: 1.6 }}
                />
              </div>
            </div>
          )}

          {/* CTA button */}
          <div style={{ margin: '8px 0 24px', textAlign: data.ctaAlignment }}>
            <div
              style={{
                display: 'inline-block', background: data.ctaBg,
                borderRadius: data.ctaBorderRadius, padding: '14px 28px',
              }}
            >
              <SimpleEditable
                value={data.ctaLabel}
                onChange={v => onChange('ctaLabel', v)}
                placeholder="Click here"
                style={{ color: data.ctaTextColor, fontSize: 15, fontWeight: 500, minWidth: 80 }}
              />
            </div>
          </div>

          {/* Sender */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
            <div data-field-light style={{ marginBottom: 2 }}>
              <SimpleEditable
                value={data.senderName}
                onChange={v => onChange('senderName', v)}
                placeholder="Sai"
                style={{ color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}
              />
            </div>
            <div data-field-light>
              <SimpleEditable
                value={data.senderTitle}
                onChange={v => onChange('senderTitle', v)}
                placeholder="Co-founder, ShopOS"
                style={{ color: '#888888', fontSize: 15 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '24px 24px 40px', textAlign: 'center' }}>
        {data.socialEnabled && activeSocial.length > 0 && (
          <div style={{ padding: '16px 0 8px', textAlign: data.socialAlignment }}>
            {activeSocial.map(s => (
              <span
                key={s.platform}
                style={{ display: 'inline-flex', width: 36, height: 36, alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', borderRadius: '50%', margin: '0 4px', verticalAlign: 'middle' }}
                dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[s.platform] || '' }}
              />
            ))}
          </div>
        )}
        <div data-field>
          <SimpleEditable
            value={data.footerNote}
            onChange={v => onChange('footerNote', v)}
            placeholder="You're receiving this because…"
            multiline
            style={{ color: '#555555', fontSize: 12, lineHeight: 1.6, textAlign: 'center' }}
          />
        </div>
      </div>
    </div>
  );
}
