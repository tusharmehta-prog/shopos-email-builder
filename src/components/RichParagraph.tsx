import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, Link, AlignLeft, AlignCenter, AlignRight, Trash2, Hash } from 'lucide-react';
import type { Alignment, LoopsContactProperty } from '../types';

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 24, 28, 32];

interface Props {
  id: string;
  html: string;
  align: Alignment;
  fontSize: number;
  placeholder: string;
  canRemove: boolean;
  contactProperties: LoopsContactProperty[];
  onChange: (html: string) => void;
  onAlignChange: (a: Alignment) => void;
  onFontSizeChange: (size: number) => void;
  onRemove: () => void;
}

export function RichParagraph({ id, html, align, fontSize, placeholder, canRemove, contactProperties, onChange, onAlignChange, onFontSizeChange, onRemove }: Props) {
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

  const insertMergeTag = (prop: LoopsContactProperty) => {
    restoreRange();
    document.execCommand('insertText', false, `{{${prop.key}}}`);
    if (ref.current) onChange(ref.current.innerHTML);
    setShowMergeTags(false);
  };

  const btn = (active = false): React.CSSProperties => ({
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, border: 'none', background: active ? '#2A2A2A' : 'transparent',
    color: active ? '#FAFAFA' : '#737373', cursor: 'pointer', padding: 0,
    transition: 'all 120ms ease',
  });

  const divider = <div style={{ width: 1, height: 14, background: '#2A2A2A', margin: '0 2px' }} />;

  return (
    <div style={{ position: 'relative' }}>
      {focused && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1, padding: '3px 5px',
          background: '#1C1B1B', border: '1px solid #2A2A2A', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', marginBottom: 4, flexWrap: 'wrap',
        }}>
          {/* Font size */}
          <select
            value={fontSize}
            onChange={e => onFontSizeChange(Number(e.target.value))}
            onMouseDown={e => e.stopPropagation()}
            style={{
              height: 22, padding: '0 4px', background: '#131313', border: '1px solid #2A2A2A',
              borderRadius: 4, color: '#FAFAFA', fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          {divider}

          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Bold"><Bold size={12} /></button>
          <button style={btn()} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Italic"><Italic size={12} /></button>
          <button
            style={btn(showLink)}
            onMouseDown={e => { e.preventDefault(); saveRange(); setShowLink(v => !v); setShowMergeTags(false); setLinkUrl(''); }}
            title="Insert link"
          ><Link size={12} /></button>

          {divider}

          {(['left', 'center', 'right'] as Alignment[]).map(a => (
            <button key={a} style={btn(align === a)} onMouseDown={e => { e.preventDefault(); onAlignChange(a); }} title={`Align ${a}`}>
              {a === 'left' ? <AlignLeft size={12} /> : a === 'center' ? <AlignCenter size={12} /> : <AlignRight size={12} />}
            </button>
          ))}

          {divider}

          <button
            style={btn(showMergeTags)}
            onMouseDown={e => { e.preventDefault(); saveRange(); setShowMergeTags(v => !v); setShowLink(false); }}
            title="Insert variable"
          ><Hash size={12} /></button>

          {canRemove && (
            <>{divider}<button style={btn()} onMouseDown={e => { e.preventDefault(); onRemove(); }} title="Remove paragraph"><Trash2 size={11} color="#DC2626" /></button></>
          )}
        </div>
      )}

      {/* Variable picker */}
      {focused && showMergeTags && (
        <div style={{
          background: '#131313', border: '1px solid #2A2A2A', borderRadius: 8,
          marginBottom: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight: 240, overflowY: 'auto',
        }}>
          <div style={{ padding: '6px 10px 4px', fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, borderBottom: '1px solid #1C1B1B' }}>
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
                transition: 'background 100ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1C1B1B')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 12, color: '#FAFAFA' }}>{prop.label}</span>
              <span style={{ fontSize: 11, color: '#525252', fontFamily: 'monospace' }}>{`{{${prop.key}}}`}</span>
            </button>
          ))}
        </div>
      )}

      {/* Link input */}
      {focused && showLink && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '7px 10px', background: '#131313', border: '1px solid #2A2A2A', borderRadius: 8, marginBottom: 4 }}>
          <Link size={11} color="#525252" />
          <input
            autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLinkInsert(); if (e.key === 'Escape') setShowLink(false); }}
            placeholder="https://..."
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#FAFAFA', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <button onClick={handleLinkInsert} style={{ height: 22, padding: '0 10px', borderRadius: 9999, border: 'none', background: '#FFFFFF', color: '#000', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Insert</button>
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
          minHeight: 68, border: '1px solid #2A2A2A', borderRadius: 8,
          padding: '10px 12px', fontSize: `${fontSize}px`, color: '#FAFAFA',
          fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.625',
          background: '#131313', outline: 'none', textAlign: align,
          transition: 'border-color 150ms ease',
        }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = '#525252')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
      />
      <style>{`[data-placeholder]:empty:before { content: attr(data-placeholder); color: #525252; pointer-events: none; }`}</style>
    </div>
  );
}
