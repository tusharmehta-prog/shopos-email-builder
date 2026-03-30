import type { TemplateType } from '../types';

interface Template {
  id: TemplateType;
  label: string;
  desc: string;
}

const TEMPLATES: Template[] = [
  { id: 'transactional', label: 'Transactional', desc: 'Billing, credits, plan events' },
  { id: 'announcement', label: 'Announcement', desc: 'Pricing, launches, changes' },
  { id: 'lifecycle', label: 'Lifecycle', desc: 'Onboarding, re-engagement' },
];

interface Props {
  value: TemplateType;
  onChange: (t: TemplateType) => void;
}

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div style={{ padding: '20px 20px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Template
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {TEMPLATES.map(t => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              style={{
                flex: 1,
                padding: '7px 8px',
                borderRadius: 9999,
                border: active ? '1px solid #FFFFFF' : '1px solid #2A2A2A',
                background: active ? '#FFFFFF' : 'transparent',
                color: active ? '#000000' : '#A3A3A3',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 150ms ease',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1,
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#525252'; e.currentTarget.style.color = '#FAFAFA'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#A3A3A3'; } }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#525252', lineHeight: 1.5 }}>
        {TEMPLATES.find(t => t.id === value)?.desc}
      </p>
    </div>
  );
}
