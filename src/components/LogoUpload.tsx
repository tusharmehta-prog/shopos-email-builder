import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  logo: string | null;
  onChange: (logo: string | null) => void;
}

export function LogoUpload({ logo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type !== 'image/png') {
      alert('Upload a PNG with transparent background — JPEGs will show a white box in email clients.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ padding: '16px 20px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Logo
      </p>

      {logo ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px',
          border: '1px solid #2A2A2A', borderRadius: 10,
          background: '#131313',
        }}>
          <div style={{ background: '#FAFAFA', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ height: 24, maxWidth: 80, objectFit: 'contain' }} />
          </div>
          <span style={{ flex: 1, fontSize: 11, color: '#525252' }}>PNG · transparent</span>
          <button
            onClick={() => onChange(null)}
            style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'color 150ms' }}
            title="Remove logo"
            onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
            onMouseLeave={e => (e.currentTarget.style.color = '#525252')}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '1px dashed #2A2A2A',
            borderRadius: 10,
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 150ms ease, background 150ms ease',
            background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#525252'; e.currentTarget.style.background = '#1C1B1B'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.background = 'transparent'; }}
          onDragEnter={e => { e.currentTarget.style.borderColor = '#FFFFFF'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
        >
          <Upload size={14} color="#525252" />
          <p style={{ margin: 0, fontSize: 12, color: '#A3A3A3', fontWeight: 500 }}>Click or drag to upload</p>
          <p style={{ margin: 0, fontSize: 11, color: '#525252' }}>PNG only — transparent background</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
