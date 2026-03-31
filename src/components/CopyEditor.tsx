import { Plus } from 'lucide-react';
import type { EmailData, Alignment, LoopsContactProperty } from '../types';
import { checkGuardrails, subjectLineHints, wordCountWarning } from '../lib/guardrails';
import { RichParagraph } from './RichParagraph';

const uid = () => Math.random().toString(36).slice(2, 9);

interface Props {
  data: EmailData;
  onChange: <K extends keyof EmailData>(key: K, value: EmailData[K]) => void;
  contactProperties: LoopsContactProperty[];
}

// Dark panel design tokens
const D = {
  panelBg: '#1C1B1B',
  inputBg: '#131313',
  inputBorder: '#2A2A2A',
  inputBorderFocus: '#525252',
  inputText: '#FAFAFA',
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#737373', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: {
    width: '100%', height: 38, border: '1px solid #2A2A2A', borderRadius: 8,
    padding: '0 12px', fontSize: 13, color: '#FAFAFA',
    fontFamily: 'Inter, system-ui, sans-serif', background: '#131313',
    boxSizing: 'border-box' as const, outline: 'none', transition: 'border-color 150ms ease',
  },
  textarea: {
    width: '100%', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px',
    fontSize: 13, color: '#FAFAFA', fontFamily: 'Inter, system-ui, sans-serif',
    background: '#131313', boxSizing: 'border-box' as const, resize: 'none' as const,
    lineHeight: '1.625', minHeight: 68, overflow: 'hidden', outline: 'none',
    transition: 'border-color 150ms ease',
  },
  fieldGroup: { marginBottom: 12 } as React.CSSProperties,
  warning: { fontSize: 11, color: '#EA580C', marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 4 } as React.CSSProperties,
  hint: { fontSize: 11, color: '#525252', marginTop: 4, lineHeight: 1.4 } as React.CSSProperties,
  divider: { height: 1, background: '#262626', margin: '8px 0 0' } as React.CSSProperties,
  sectionLabel: { margin: '0 0 12px', fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
};

function Warnings({ warnings }: { warnings: string[] }) {
  return warnings.length ? (
    <div>{warnings.map((w, i) => <div key={i} style={D.warning}><span>⚠</span><span>{w}</span></div>)}</div>
  ) : null;
}

function Field({
  label, value, onChange, placeholder, hint, multiline, autoResize, charCount, warnings, hintItems, action
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  hint?: string; multiline?: boolean; autoResize?: boolean; charCount?: boolean;
  warnings?: string[]; hintItems?: string[];
  action?: React.ReactNode;
}) {
  const charColor = value.length < 40 ? '#16A34A' : value.length < 60 ? '#EA580C' : '#DC2626';
  return (
    <div style={D.fieldGroup}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={D.label}>{label}</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {action}
          {charCount && <span style={{ fontSize: 11, color: charColor, fontWeight: 600, fontFamily: 'monospace' }}>{value.length}</span>}
        </div>
      </div>
      {multiline ? (
        <textarea
          style={D.textarea}
          value={value}
          placeholder={placeholder}
          rows={3}
          onChange={e => onChange(e.target.value)}
          onInput={autoResize ? e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } : undefined}
          onFocus={e => (e.currentTarget.style.borderColor = D.inputBorderFocus)}
          onBlur={e => (e.currentTarget.style.borderColor = D.inputBorder)}
        />
      ) : (
        <input
          style={D.input}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={e => (e.currentTarget.style.borderColor = D.inputBorderFocus)}
          onBlur={e => (e.currentTarget.style.borderColor = D.inputBorder)}
        />
      )}
      {hint && <div style={D.hint}>{hint}</div>}
      {hintItems?.map((h, i) => <div key={i} style={D.warning}><span>⚠</span><span>{h}</span></div>)}
      {warnings && <Warnings warnings={warnings} />}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div style={{ padding: '18px 20px 0' }}><p style={D.sectionLabel}>{title}</p></div>;
}

export function CopyEditor({ data, onChange, contactProperties }: Props) {
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

  const hasUnsubLink = data.footerNote.includes('{unsubscribe_link}');

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Email header */}
      <SectionHeader title="Email header" />
      <div style={{ padding: '10px 20px 0' }}>
        <Field
          label="Subject line" value={data.subjectLine}
          onChange={v => onChange('subjectLine', v)}
          placeholder="nothing changes for you"
          charCount
          hintItems={subjectLineHints(data.subjectLine)}
          warnings={checkGuardrails(data.subjectLine)}
        />
        <Field
          label="Preview text" value={data.previewText}
          onChange={v => onChange('previewText', v)}
          placeholder="One line shown in inbox before they open"
          warnings={checkGuardrails(data.previewText)}
        />
      </div>

      <div style={D.divider} />

      {/* Hero */}
      <SectionHeader title="Hero" />
      <div style={{ padding: '10px 20px 0' }}>
        <Field label="Headline" value={data.heroHeadline} onChange={v => onChange('heroHeadline', v)} placeholder="Something's changing. Not for you." warnings={checkGuardrails(data.heroHeadline)} />
        <Field label="Subheading" value={data.heroSubheading} onChange={v => onChange('heroSubheading', v)} placeholder="A note on what's new." warnings={checkGuardrails(data.heroSubheading)} />
      </div>

      <div style={D.divider} />

      {/* Body */}
      <SectionHeader title="Body" />
      <div style={{ padding: '10px 20px 0' }}>
        <Field label="Greeting" value={data.greeting} onChange={v => onChange('greeting', v)} placeholder="Hey" hint="{First Name} works as a merge tag" />

        <div style={D.fieldGroup}>
          <label style={D.label}>Body paragraphs</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.bodyParagraphs.map((p, i) => {
              const wcWarn = wordCountWarning(p.html.replace(/<[^>]+>/g, ' '));
              const gWarns = checkGuardrails(p.html.replace(/<[^>]+>/g, ' '));
              return (
                <div key={p.id}>
                  <RichParagraph
                    id={p.id}
                    html={p.html}
                    align={p.align}
                    fontSize={p.fontSize ?? 16}
                    placeholder={`Paragraph ${i + 1}`}
                    canRemove={data.bodyParagraphs.length > 1}
                    contactProperties={contactProperties}
                    onChange={html => updateParagraph(p.id, 'html', html)}
                    onAlignChange={a => updateParagraph(p.id, 'align', a)}
                    onFontSizeChange={size => updateParagraph(p.id, 'fontSize', size)}
                    onRemove={() => removeParagraph(p.id)}
                  />
                  {wcWarn && <div style={D.warning}><span>⚠</span><span>{wcWarn}</span></div>}
                  <Warnings warnings={gWarns} />
                </div>
              );
            })}
          </div>
          <button
            onClick={addParagraph}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              width: '100%', height: 34, borderRadius: 9999, marginTop: 8,
              border: '1px solid #2A2A2A', background: 'transparent',
              color: '#525252', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 150ms ease', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#525252'; e.currentTarget.style.color = '#FAFAFA'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#525252'; }}
          >
            <Plus size={12} /> Add paragraph
          </button>
        </div>

        {/* Callout */}
        <div style={{ border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 14px', marginBottom: 12, background: '#131313' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: data.calloutEnabled ? 14 : 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Callout block</span>
            <button
              onClick={() => onChange('calloutEnabled', !data.calloutEnabled)}
              style={{ width: 38, height: 20, borderRadius: 9999, border: 'none', background: data.calloutEnabled ? '#1ca64d' : '#2A2A2A', cursor: 'pointer', position: 'relative', transition: 'background 150ms ease', flexShrink: 0 }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFF', position: 'absolute', top: 3, left: data.calloutEnabled ? 21 : 3, transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
          {data.calloutEnabled && (
            <>
              <Field label="Callout title" value={data.calloutTitle} onChange={v => onChange('calloutTitle', v)} placeholder="Your plan stays the same." warnings={checkGuardrails(data.calloutTitle)} />
              <Field label="Callout body" value={data.calloutBody} onChange={v => onChange('calloutBody', v)} placeholder="One to two sentences." multiline autoResize warnings={checkGuardrails(data.calloutBody)} />
            </>
          )}
        </div>

        <Field label="CTA label" value={data.ctaLabel} onChange={v => onChange('ctaLabel', v)} placeholder="View your dashboard" />
        <Field label="CTA URL" value={data.ctaUrl} onChange={v => onChange('ctaUrl', v)} placeholder="https://app.shopos.ai" hint="UTM params auto-appended on export" />
      </div>

      <div style={D.divider} />

      {/* Footer */}
      <SectionHeader title="Footer" />
      <div style={{ padding: '10px 20px 0' }}>
        <Field label="Sender name" value={data.senderName} onChange={v => onChange('senderName', v)} placeholder="Sai" />
        <Field label="Sender title" value={data.senderTitle} onChange={v => onChange('senderTitle', v)} placeholder="Co-founder, ShopOS" />
        <Field
          label="Footer note"
          value={data.footerNote}
          onChange={v => onChange('footerNote', v)}
          placeholder="You're receiving this because..."
          multiline
          action={
            !hasUnsubLink ? (
              <button
                onClick={() => onChange('footerNote', data.footerNote ? data.footerNote + ' {unsubscribe_link}' : '{unsubscribe_link}')}
                style={{ fontSize: 10, color: '#EA580C', background: 'none', border: '1px solid #EA580C', borderRadius: 9999, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                title="Required by Loops for campaign emails"
              >
                + unsubscribe
              </button>
            ) : undefined
          }
          warnings={!hasUnsubLink ? ['Missing {unsubscribe_link} — required for Loops campaign emails'] : []}
        />
      </div>
    </div>
  );
}
