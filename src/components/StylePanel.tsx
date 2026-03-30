import { useState, useEffect } from 'react';
import type { EmailData, Alignment } from '../types';

interface Props {
  data: EmailData;
  onChange: <K extends keyof EmailData>(key: K, value: EmailData[K]) => void;
}

const D = {
  sectionLabel: { margin: '0 0 14px', fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  label: { fontSize: 11, fontWeight: 500, color: '#A3A3A3' } as React.CSSProperties,
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } as React.CSSProperties,
  divider: { height: 1, background: '#262626', margin: '8px 0' } as React.CSSProperties,
};

const COLOR_PRESETS = [
  { name: 'Obsidian', heroBg: '#0A0A0A', ctaBg: '#0A0A0A', ctaTextColor: '#FFFFFF', cardBg: '#FFFFFF', swatchTop: '#0A0A0A', swatchBot: '#FFFFFF' },
  { name: 'Cloud', heroBg: '#F4F4F4', ctaBg: '#1a1a1a', ctaTextColor: '#FFFFFF', cardBg: '#FFFFFF', swatchTop: '#F4F4F4', swatchBot: '#E5E5E5' },
  { name: 'Forest', heroBg: '#14532D', ctaBg: '#16A34A', ctaTextColor: '#FFFFFF', cardBg: '#FFFFFF', swatchTop: '#14532D', swatchBot: '#16A34A' },
  { name: 'Vulcan', heroBg: '#000000', ctaBg: '#EA580C', ctaTextColor: '#FFFFFF', cardBg: '#FFFFFF', swatchTop: '#000000', swatchBot: '#EA580C' },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [localHex, setLocalHex] = useState(value);
  useEffect(() => { setLocalHex(value); }, [value]);

  const handleTextChange = (v: string) => {
    setLocalHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <div style={D.row}>
      <span style={D.label}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: value, border: '1px solid #333', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
            <input
              type="color" value={value}
              onChange={e => { setLocalHex(e.target.value); onChange(e.target.value); }}
              style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', opacity: 0, cursor: 'pointer', transform: 'translate(-25%, -25%)' }}
            />
          </div>
        </div>
        <input
          type="text"
          value={localHex.toUpperCase()}
          onChange={e => handleTextChange(e.target.value)}
          style={{
            width: 74, height: 28, background: '#131313', border: '1px solid #2A2A2A',
            borderRadius: 6, padding: '0 8px', fontSize: 11, color: '#FAFAFA',
            fontFamily: 'monospace', outline: 'none', transition: 'border-color 150ms',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#525252')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
        />
      </div>
    </div>
  );
}

function AlignField({ label, value, onChange, options }: {
  label: string; value: Alignment | 'left' | 'center';
  onChange: (v: Alignment) => void;
  options?: Alignment[];
}) {
  const opts = options ?? (['left', 'center', 'right'] as Alignment[]);
  return (
    <div style={D.row}>
      <span style={D.label}>{label}</span>
      <div style={{ display: 'flex', background: '#131313', borderRadius: 9999, padding: 2, gap: 1, border: '1px solid #2A2A2A' }}>
        {opts.map(a => (
          <button
            key={a}
            onClick={() => onChange(a)}
            style={{
              padding: '3px 10px', borderRadius: 9999, border: 'none',
              background: value === a ? '#FFFFFF' : 'transparent',
              color: value === a ? '#000' : '#525252',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 150ms ease', fontFamily: 'inherit',
            }}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, unit = 'px', onChange }: {
  label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={D.label}>{label}</span>
        <span style={{ fontSize: 11, color: '#FAFAFA', fontFamily: 'monospace', fontWeight: 500 }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 3, accentColor: '#FFFFFF', cursor: 'pointer' }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ ...D.label, color: '#FAFAFA', fontSize: 12 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{ width: 38, height: 20, borderRadius: 9999, border: 'none', background: value ? '#1ca64d' : '#2A2A2A', cursor: 'pointer', position: 'relative', transition: 'background 150ms ease', flexShrink: 0 }}
      >
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFF', position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  { id: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://x.com/shopos' },
  { id: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/shopos' },
  { id: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/shopos' },
  { id: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/shopos' },
  { id: 'tiktok' as const, label: 'TikTok', placeholder: 'https://tiktok.com/@shopos' },
];

export function StylePanel({ data, onChange }: Props) {
  const togglePlatform = (platformId: string) => {
    const existing = data.socialLinks.find(s => s.platform === platformId);
    if (existing) {
      onChange('socialLinks', data.socialLinks.map(s =>
        s.platform === platformId ? { ...s, enabled: !s.enabled } : s
      ));
    } else {
      const p = SOCIAL_PLATFORMS.find(p => p.id === platformId)!;
      onChange('socialLinks', [...data.socialLinks, { platform: platformId as never, label: p.label.split(' /')[0], url: '', enabled: true }]);
    }
  };

  const updatePlatformUrl = (platformId: string, url: string) => {
    const existing = data.socialLinks.find(s => s.platform === platformId);
    if (existing) {
      onChange('socialLinks', data.socialLinks.map(s =>
        s.platform === platformId ? { ...s, url } : s
      ));
    } else {
      const p = SOCIAL_PLATFORMS.find(p => p.id === platformId)!;
      onChange('socialLinks', [...data.socialLinks, { platform: platformId as never, label: p.label.split(' /')[0], url, enabled: true }]);
    }
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    onChange('heroBg', preset.heroBg);
    onChange('ctaBg', preset.ctaBg);
    onChange('ctaTextColor', preset.ctaTextColor);
    onChange('cardBg', preset.cardBg);
  };

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* Theme Presets */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={D.sectionLabel}>Theme presets</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 4 }}>
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              title={`Apply ${preset.name} theme`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: '100%', aspectRatio: '1 / 1', borderRadius: 10,
                border: '1px solid #2A2A2A', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'border-color 150ms, box-shadow 150ms',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#525252'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ flex: 1, background: preset.swatchTop }} />
                <div style={{ flex: 1, background: preset.swatchBot }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={D.divider} />

      {/* Logo */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={D.sectionLabel}>Logo</p>
        <AlignField label="Alignment" value={data.logoAlignment} onChange={v => onChange('logoAlignment', v)} />
        <Slider label="Size" value={data.logoSize} min={24} max={96} onChange={v => onChange('logoSize', v)} />
      </div>

      <div style={D.divider} />

      {/* Hero */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={D.sectionLabel}>Hero</p>
        <ColorField label="Background" value={data.heroBg} onChange={v => onChange('heroBg', v)} />
        <AlignField label="Text alignment" value={data.heroAlignment} onChange={v => onChange('heroAlignment', v as 'left' | 'center')} options={['left', 'center']} />
      </div>

      <div style={D.divider} />

      {/* Card */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={D.sectionLabel}>Card</p>
        <ColorField label="Background" value={data.cardBg} onChange={v => onChange('cardBg', v)} />
        <Slider label="Corner radius" value={data.cardBorderRadius} min={0} max={32} onChange={v => onChange('cardBorderRadius', v)} />
      </div>

      <div style={D.divider} />

      {/* Callout */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={D.sectionLabel}>Callout block</p>
        <Slider label="Corner radius" value={data.calloutBorderRadius} min={0} max={32} onChange={v => onChange('calloutBorderRadius', v)} />
      </div>

      <div style={D.divider} />

      {/* CTA */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={D.sectionLabel}>CTA button</p>
        <ColorField label="Background" value={data.ctaBg} onChange={v => onChange('ctaBg', v)} />
        <ColorField label="Text color" value={data.ctaTextColor} onChange={v => onChange('ctaTextColor', v)} />
        <AlignField label="Alignment" value={data.ctaAlignment} onChange={v => onChange('ctaAlignment', v as 'left' | 'center')} options={['left', 'center']} />
        <Slider label="Corner radius" value={data.ctaBorderRadius} min={0} max={24} onChange={v => onChange('ctaBorderRadius', v)} />
      </div>

      <div style={D.divider} />

      {/* Social */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ ...D.sectionLabel, margin: 0 }}>Follow buttons</p>
          <button
            onClick={() => onChange('socialEnabled', !data.socialEnabled)}
            style={{ width: 38, height: 20, borderRadius: 9999, border: 'none', background: data.socialEnabled ? '#1ca64d' : '#2A2A2A', cursor: 'pointer', position: 'relative', transition: 'background 150ms ease', flexShrink: 0 }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFF', position: 'absolute', top: 3, left: data.socialEnabled ? 21 : 3, transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </button>
        </div>

        {data.socialEnabled && (
          <>
            <AlignField label="Alignment" value={data.socialAlignment} onChange={v => onChange('socialAlignment', v)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
              {SOCIAL_PLATFORMS.map(platform => {
                const link = data.socialLinks.find(s => s.platform === platform.id);
                const enabled = link?.enabled ?? false;
                return (
                  <div key={platform.id}>
                    <Toggle label={platform.label} value={enabled} onChange={() => togglePlatform(platform.id)} />
                    {enabled && (
                      <input
                        value={link?.url || ''}
                        onChange={e => updatePlatformUrl(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        style={{
                          width: '100%', height: 32, background: '#131313',
                          border: '1px solid #2A2A2A', borderRadius: 6,
                          padding: '0 10px', fontSize: 11, color: '#FAFAFA',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          boxSizing: 'border-box' as const, outline: 'none',
                          marginBottom: 6, transition: 'border-color 150ms',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#525252')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
