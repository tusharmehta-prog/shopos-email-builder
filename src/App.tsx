import { useState, useEffect, useRef } from 'react';
import { Mail, Settings, LayoutDashboard, Users, HelpCircle, Zap, X, Check, Loader } from 'lucide-react';
import type { EmailData, ViewportMode, LoopsContactProperty } from './types';
import { TEMPLATE_DEFAULTS, DEFAULT_EMAIL_DATA } from './lib/templates';
import { TemplatePicker } from './components/TemplatePicker';
import { LogoUpload } from './components/LogoUpload';
import { CopyEditor } from './components/CopyEditor';
import { StylePanel } from './components/StylePanel';
import { Preview } from './components/Preview';
import { exportZip } from './lib/export';
import { getStoredApiKey, saveApiKey, clearApiKey, getStoredProperties, fetchContactProperties, DEFAULT_MERGE_PROPS } from './lib/loops';

type Tab = 'content' | 'style';

const DRAFT_KEY = 'shopos-email-draft';

function useSavedAgo(savedAt: Date | null): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(id);
  }, [savedAt]);
  if (!savedAt) return '';
  const secs = Math.floor((Date.now() - savedAt.getTime()) / 1000);
  if (secs < 10) return 'Saved';
  if (secs < 60) return `Saved ${secs}s ago`;
  return `Saved ${Math.floor(secs / 60)}m ago`;
}

export default function App() {
  const [emailData, setEmailData] = useState<EmailData>(() => {
    try { const s = localStorage.getItem(DRAFT_KEY); if (s) return JSON.parse(s) as EmailData; } catch {}
    return DEFAULT_EMAIL_DATA;
  });
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [persistedLogo, setPersistedLogo] = useState<string | null>(() => {
    try { const s = localStorage.getItem(DRAFT_KEY); if (s) return (JSON.parse(s) as EmailData).logoBase64 ?? null; } catch {}
    return null;
  });
  const [tab, setTab] = useState<Tab>('content');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showLoopsConnect, setShowLoopsConnect] = useState(false);
  const [loopsApiKeyInput, setLoopsApiKeyInput] = useState('');
  const [loopsConnecting, setLoopsConnecting] = useState(false);
  const [loopsError, setLoopsError] = useState('');
  const [contactProperties, setContactProperties] = useState<LoopsContactProperty[]>(() => {
    return getStoredProperties() ?? DEFAULT_MERGE_PROPS;
  });
  const isLoopsConnected = getStoredApiKey().length > 0;
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const savedAgo = useSavedAgo(savedAt);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(emailData));
      setSavedAt(new Date());
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [emailData]);

  const updateField = <K extends keyof EmailData>(key: K, value: EmailData[K]) => {
    setEmailData(prev => ({ ...prev, [key]: value }));
    if (key === 'logoBase64') setPersistedLogo(value as string | null);
  };

  const handleTemplateChange = (t: EmailData['template']) => {
    setEmailData({ ...TEMPLATE_DEFAULTS[t], logoBase64: persistedLogo });
  };

  const handlePublish = async () => {
    setPublishing(true);
    try { await exportZip(emailData); } finally { setPublishing(false); }
  };

  const handleLoopsConnect = async () => {
    if (!loopsApiKeyInput.trim()) return;
    setLoopsConnecting(true);
    setLoopsError('');
    try {
      const props = await fetchContactProperties(loopsApiKeyInput.trim());
      saveApiKey(loopsApiKeyInput.trim());
      setContactProperties(props);
      setShowLoopsConnect(false);
      setLoopsApiKeyInput('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to connect';
      // 500 with empty body often means wrong key format or Loops server issue
      if (msg.includes('500') || msg.includes('Failed to fetch')) {
        setLoopsError('Loops returned an error. Check your API key (Settings → API in Loops). You can also skip and use default properties.');
      } else {
        setLoopsError(msg);
      }
    } finally {
      setLoopsConnecting(false);
    }
  };

  const handleSkipLoops = () => {
    // Save key anyway (might work later), proceed with defaults
    if (loopsApiKeyInput.trim()) saveApiKey(loopsApiKeyInput.trim());
    setContactProperties(DEFAULT_MERGE_PROPS);
    setShowLoopsConnect(false);
    setLoopsError('');
    setLoopsApiKeyInput('');
  };

  const handleLoopsDisconnect = () => {
    clearApiKey();
    setContactProperties(DEFAULT_MERGE_PROPS);
    setShowLoopsConnect(false);
  };

  const sideIcons = [
    { icon: <Mail size={15} />, label: 'Email Builder', active: true },
    { icon: <LayoutDashboard size={15} />, label: 'Templates', active: false },
    { icon: <Users size={15} />, label: 'Audience', active: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflow: 'hidden', background: '#0A0A0A' }}>

      {/* Topbar */}
      <header style={{ height: 48, background: '#0A0A0A', borderBottom: '1px solid #1C1B1B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>ShopOS</span>
          <nav style={{ display: 'flex', gap: 2 }}>
            {[
              { label: 'Editor', active: true },
              { label: 'Analytics', active: false },
              { label: 'Audience', active: false },
            ].map(item => (
              <button key={item.label} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', background: item.active ? '#1C1B1B' : 'transparent',
                color: item.active ? '#FFFFFF' : '#525252', fontSize: 12, fontWeight: item.active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
              }}
                onMouseEnter={e => { if (!item.active) e.currentTarget.style.color = '#A3A3A3'; }}
                onMouseLeave={e => { if (!item.active) e.currentTarget.style.color = '#525252'; }}
              >{item.label}</button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {savedAgo && <span style={{ fontSize: 11, color: '#525252', marginRight: 4 }}>{savedAgo}</span>}

          {/* Loops connect button */}
          <button
            onClick={() => { setShowLoopsConnect(v => !v); setLoopsError(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 28, padding: '0 12px', borderRadius: 9999, border: '1px solid',
              borderColor: isLoopsConnected ? '#1ca64d' : '#2A2A2A',
              background: isLoopsConnected ? 'rgba(28,166,77,0.1)' : 'transparent',
              color: isLoopsConnected ? '#1ca64d' : '#A3A3A3',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
            }}
          >
            <Zap size={10} />
            {isLoopsConnected ? 'Loops connected' : 'Connect Loops'}
          </button>

          {/* Loops connect dropdown */}
          {showLoopsConnect && (
            <div style={{
              position: 'absolute', top: 36, right: 0, width: 320,
              background: '#1C1B1B', border: '1px solid #2A2A2A', borderRadius: 10,
              padding: 16, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FAFAFA' }}>Connect to Loops</span>
                <button onClick={() => setShowLoopsConnect(false)} style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer', padding: 2 }}><X size={12} /></button>
              </div>
              {isLoopsConnected ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'rgba(28,166,77,0.1)', borderRadius: 6, marginBottom: 10 }}>
                    <Check size={12} color="#1ca64d" />
                    <span style={{ fontSize: 12, color: '#1ca64d' }}>Connected — {contactProperties.length} properties loaded</span>
                  </div>
                  <button onClick={handleLoopsDisconnect} style={{ width: '100%', height: 30, borderRadius: 6, border: '1px solid #2A2A2A', background: 'transparent', color: '#737373', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: '#737373', lineHeight: 1.5 }}>
                    Enter your Loops API key to pull your contact properties into the variable picker.
                  </p>
                  <input
                    value={loopsApiKeyInput}
                    onChange={e => setLoopsApiKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLoopsConnect()}
                    placeholder="loops_api_key_..."
                    style={{
                      width: '100%', height: 34, background: '#131313', border: '1px solid #2A2A2A',
                      borderRadius: 6, padding: '0 10px', fontSize: 12, color: '#FAFAFA',
                      fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', marginBottom: 8,
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#525252')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
                    autoFocus
                  />
                  {loopsError && (
                    <div style={{ marginBottom: 8 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 11, color: '#EA580C', lineHeight: 1.5 }}>{loopsError}</p>
                      {loopsError.includes('skip') && (
                        <button
                          onClick={handleSkipLoops}
                          style={{ fontSize: 11, color: '#737373', background: 'none', border: '1px solid #2A2A2A', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Use default properties →
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleLoopsConnect}
                    disabled={loopsConnecting}
                    style={{
                      width: '100%', height: 30, borderRadius: 6, border: 'none',
                      background: loopsConnecting ? '#2A2A2A' : '#FFFFFF', color: loopsConnecting ? '#525252' : '#000',
                      fontSize: 11, fontWeight: 700, cursor: loopsConnecting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {loopsConnecting ? <><Loader size={10} />Connecting...</> : 'Connect'}
                  </button>
                </div>
              )}
            </div>
          )}

          <button style={{
            height: 28, padding: '0 14px', borderRadius: 9999, border: '1px solid #2A2A2A',
            background: 'transparent', color: '#A3A3A3', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#525252'; e.currentTarget.style.color = '#FAFAFA'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#A3A3A3'; }}
            onClick={() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(emailData)); setSavedAt(new Date()); }}
          >Save</button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              height: 28, padding: '0 16px', borderRadius: 9999, border: 'none',
              background: publishing ? '#333' : '#FFFFFF', color: publishing ? '#737373' : '#000',
              fontSize: 11, fontWeight: 700, cursor: publishing ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 150ms', letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { if (!publishing) e.currentTarget.style.background = '#E5E5E5'; }}
            onMouseLeave={e => { if (!publishing) e.currentTarget.style.background = '#FFFFFF'; }}
          >{publishing ? 'Exporting...' : 'Publish'}</button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{ width: 48, minWidth: 48, background: '#0A0A0A', borderRight: '1px solid #1C1B1B', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, paddingBottom: 10, zIndex: 40 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            {sideIcons.map(item => (
              <button
                key={item.label}
                title={item.label}
                style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: 'none', background: item.active ? '#1C1B1B' : 'transparent',
                  color: item.active ? '#FFFFFF' : '#525252', cursor: 'pointer', transition: 'all 150ms',
                  borderLeft: item.active ? '2px solid #FFFFFF' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!item.active) { e.currentTarget.style.color = '#A3A3A3'; e.currentTarget.style.background = '#1C1B1B'; } }}
                onMouseLeave={e => { if (!item.active) { e.currentTarget.style.color = '#525252'; e.currentTarget.style.background = 'transparent'; } }}
              >{item.icon}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <button title="Settings" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', color: '#525252', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#A3A3A3'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#525252'; }}
            ><Settings size={14} /></button>
            <button title="Help" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', color: '#525252', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#A3A3A3'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#525252'; }}
            ><HelpCircle size={14} /></button>
          </div>
        </aside>

        {/* Left editor panel — dark */}
        <section style={{ width: 440, minWidth: 440, background: '#1C1B1B', borderRight: '1px solid #262626', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Template + Logo — pinned */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid #262626', paddingBottom: 20 }}>
            <TemplatePicker value={emailData.template} onChange={handleTemplateChange} />
            <LogoUpload logo={emailData.logoBase64} onChange={logo => updateField('logoBase64', logo)} />
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #262626', padding: '0 20px', flexShrink: 0 }}>
            {(['content', 'style'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '11px 0', marginRight: 20, border: 'none', background: 'none',
                  color: tab === t ? '#FFFFFF' : '#525252',
                  fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: tab === t ? '2px solid #FFFFFF' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 150ms ease',
                }}
              >
                {t === 'content' ? 'Content' : 'Style'}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'content'
              ? <CopyEditor data={emailData} onChange={updateField} contactProperties={contactProperties} />
              : <StylePanel data={emailData} onChange={updateField} />
            }
          </div>
        </section>

        {/* Right: preview */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
          <Preview data={emailData} viewportMode={viewportMode} onViewportChange={setViewportMode} onChange={updateField} contactProperties={contactProperties} />
        </div>

      </div>
    </div>
  );
}
