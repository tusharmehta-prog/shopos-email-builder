import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, Link, AlignLeft, AlignCenter, AlignRight, Trash2, Hash } from 'lucide-react';
import type { Alignment } from '../types';

interface Props {
  id: string;
  html: string;
  align: Alignment;
  placeholder: string;
  canRemove: boolean;
  onChange: (html: string) => void;
  onAlignChange: (a: Alignment) => void;
  onRemove: () => void;
}

const MERGE_TAGS = [
  { label: 'First name', value: '{first_name}' },
  { label: 'Email', value: '{email}' },
  { label: 'Company', value: '{company}' },
  { label: 'Plan name', value: '{plan_name}' },
  { label: 'Credits', value: '{credits}' },
  { label: 'Renewal date', value: '{renewal_date}' },
  { label: 'Unsubscribe link', value: '{unsubscribe_link}' },
];

export function RichParagraph({ id, html, align, placeholder, canRemove, onChange, onAlignChange, onRemove }: Props) {
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
      document.execCommand('insertHTML', false, `<a href="${linkUrl}" style="color:#FAFAFA;text-decoration:underline;">link</a>`);
    }
    if (ref.current) onChange(ref.current.innerHTML);
    setShowLink(false);
    setLinkUrl('');
  };

  const insertMergeTag = (tag: string) => {
    restoreRange();
    document.execCommand('insertText', false, tag);
    if (ref.current) onChange(ref.current.innerHTML);
    setShowMergeTags(false);
  };

  const btn = (active = false): React.CSSProperties => ({
    width: 24, height: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, border: 'none',
    background: active ? '#2A2A2A' : 'transparent',
    color: active ? '#FAFAFA' : '#737373',
    cursor: 'pointer', padding: 0,
    transition: 'all 120ms ease',
  });

  return (
    <div style={{ position: 'relative' }}>
      {focused && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1,
          padding: '3px 5px',
          background: '#1C1B1B',
          border: '1px solid #2A2A2A',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          marginBottom: 4,
          flexWrap: 'wrap',
        }}>
          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Bold"><Bold size={12} /></button>
          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Italic"><Italic size={12} /></button>
          <button
            style={btn(showLink)}
            onMouseDown={e => { e.preventDefault(); saveRange(); setShowLink(v => !v); setShowMergeTags(false); setLinkUrl(''); }}
            title="Insert link"
          ><Link size={12} /></button>
          <div style={{ width: 1, height: 14, background: '#2A2A2A', margin: '0 2px' }} />
          {(['left', 'center', 'right'] as Alignment[]).map(a => (
            <button key={a} style={btn(align === a)} onMouseDown={e => { e.preventDefault(); onAlignChange(a); }} title={`Align ${a}`}>
              {a === 'left' ? <AlignLeft size={12} /> : a === 'center' ? <AlignCenter size={12} /> : <AlignRight size={12} />}
            </button>
          ))}
          <div style={{ width: 1, height: 14, background: '#2A2A2A', margin: '0 2px' }} />
          <button
            style={btn(showMergeTags)}
            onMouseDown={e => { e.preventDefault(); saveRange(); setShowMergeTags(v => !v); setShowLink(false); }}
            title="Insert merge tag"
          ><Hash size={12} /></button>
          {canRemove && (
            <>
              <div style={{ width: 1, height: 14, background: '#2A2A2A', margin: '0 2px' }} />
              <button style={btn()} onMouseDown={e => { e.preventDefault(); onRemove(); }} title="Remove paragraph">
                <Trash2 size={11} color="#DC2626" />
              </button>
            </>
          )}
        </div>
      )}

      {focused && showMergeTags && (
        <div style={{
          background: '#131313', border: '1px solid #2A2A2A',
          borderRadius: 8, marginBottom: 4, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '6px 10px 4px', fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Merge tags</div>
          {MERGE_TAGS.map(tag => (
            <button
              key={tag.value}
              onMouseDown={e => { e.preventDefault(); insertMergeTag(tag.value); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '7px 10px', border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1C1B1B')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 12, color: '#FAFAFA' }}>{tag.label}</span>
              <span style={{ fontSize: 11, color: '#525252', fontFamily: 'monospace' }}>{tag.value}</span>
            </button>
          ))}
        </div>
      )}

      {focused && showLink && (
        <div style={{
          display: 'flex', gap: 6, alignItems: 'center',
          padding: '7px 10px',
          background: '#131313', border: '1px solid #2A2A2A',
          borderRadius: 8, marginBottom: 4,
        }}>
          <Link size={11} color="#525252" />
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLinkInsert(); if (e.key === 'Escape') setShowLink(false); }}
            placeholder="https://..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 12, color: '#FAFAFA', outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          <button
            onClick={handleLinkInsert}
            style={{
              height: 22, padding: '0 10px', borderRadius: 9999,
              border: 'none', background: '#FFFFFF', color: '#000',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >Insert</button>
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
          minHeight: 68,
          border: '1px solid #2A2A2A',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 13,
          color: '#FAFAFA',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '1.625',
          background: '#131313',
          outline: 'none',
          textAlign: align,
          transition: 'border-color 150ms ease',
        }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = '#525252')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
      />

      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #525252;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
