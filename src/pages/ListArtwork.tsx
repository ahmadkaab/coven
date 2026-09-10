import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadSimple, X, CheckCircle, Warning, IdentificationCard, ShieldCheck, LockKey, Sparkle } from '@phosphor-icons/react';
import { uploadToCloudinary, type UploadProgress } from '../config/cloudinary';
import { createArtwork, publishArtwork } from '../services/artworkService';
import { WatermarkOverlay } from '../components/artwork/WatermarkOverlay';
import { type WatermarkStyle, WATERMARK_PRESETS } from '../services/vaultService';
import { useAuth } from '../hooks/useAuth';
import type { ListingType } from '../types';

const TAGS_OPTIONS = [
  'Digital Art', 'Pixel Art', 'Scene Art', 'Logo', 'Portrait',
  'Faction Banner', 'Signature', 'Wallpaper', 'Avatar', 'Dark Art',
  'Concept Art', 'Typography',
];

type Step = 'upload' | 'details' | 'preview' | 'done';

export function ListArtwork() {
  const { artistId } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState<Step>('upload');
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [upload, setUpload]       = useState<UploadProgress | null>(null);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [listingType, setListingType]   = useState<ListingType>('fixed');
  const [price, setPrice]               = useState('');
  const [auctionEnd, setAuctionEnd]     = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [artworkId, setArtworkId]       = useState<string | null>(null);
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>('MATRIX_GRID');
  const [watermarkPreview, setWatermarkPreview] = useState<boolean>(true);
  const [isNsfw, setIsNsfw]             = useState<boolean>(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Step 1: File select + upload ────────────────────────
  const handleFileSelect = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleUseSample = () => {
    const sampleUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
    setImageUrl(sampleUrl);
    setPreview(sampleUrl);
    setTitle('NEON SYNDICATE PROTOCOL');
    setDescription('Exclusive cyber-noir generative banner minted for Torn Underworld Syndicates. Features custom holographic security layer.');
    setPrice('5000000');
    setSelectedTags(['Digital Art', 'Faction Banner', 'Concept Art']);
    setStep('details');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      const { url } = await uploadToCloudinary(file, {
        folder: 'coven/artworks',
        onProgress: (p) => setUpload(p),
      });
      setImageUrl(url);
      setStep('details');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );

  // ── Step 3: Save to Supabase ────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!artistId || !imageUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      const artwork = await createArtwork({
        artist_id:        artistId,
        title:            title.trim(),
        description:      description.trim() || undefined,
        image_url:        imageUrl,
        thumbnail_url:    imageUrl,
        listing_type:     listingType,
        price_torn:       price ? parseInt(price.replace(/\D/g, ''), 10) : undefined,
        auction_end_time: listingType === 'auction' && auctionEnd ? new Date(auctionEnd).toISOString() : undefined,
        tags:             selectedTags,
        is_nsfw:          isNsfw,
        status:           'draft',
      });
      setArtworkId(artwork.id);
      if (publish) {
        await publishArtwork(artwork.id);
      }
      setStep('done');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Progress bar ──────────────────────────────────────── */
  const UploadBar = () => (
    upload && !upload.done ? (
      <div style={{ marginTop: 'var(--sp-4)' }}>
        <div style={{ height: 2, background: 'var(--hull)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            background: 'var(--red)', width: `${upload.percent}%`,
            transition: 'width 0.1s',
          }} />
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', marginTop: '4px' }}>
          UPLOADING {upload.percent}%
        </div>
      </div>
    ) : null
  );

  /* ── Step indicator ────────────────────────────────────── */
  const steps: Step[] = ['upload', 'details', 'preview', 'done'];
  const StepIndicator = () => (
    <div style={{ display: 'flex', gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-8)' }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          flex: 1, padding: 'var(--sp-3)',
          background: s === step ? 'var(--void)' : step === 'done' || steps.indexOf(step) > i ? 'var(--plate)' : 'var(--pit)',
          borderBottom: s === step ? '2px solid var(--red)' : '2px solid transparent',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: s === step ? 'var(--phosphor)' : 'var(--shadow-type)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {String(i + 1).padStart(2, '0')} {s}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>
      <div style={{ borderBottom: '2px solid var(--red)', background: 'var(--pit)', paddingTop: '24px' }}>
        <div className="container">
          <div style={{ padding: 'var(--sp-6) 0 var(--sp-5)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--shadow-type)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              [ NEW LISTING ]
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', color: 'var(--phosphor)' }}>
              LIST ARTWORK
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 720, paddingTop: 'var(--sp-10)' }}>
        {!artistId ? (
          <div style={{ background: 'var(--plate)', border: '1px solid var(--hull)', padding: 'var(--sp-12)', textAlign: 'center' }}>
            <IdentificationCard size={48} color="var(--red-hi)" weight="thin" style={{ margin: '0 auto var(--sp-4)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--phosphor)', letterSpacing: '-0.03em', marginBottom: 'var(--sp-3)' }}>
              ARTIST PROFILE REQUIRED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', lineHeight: 1.8, maxWidth: 460, margin: '0 auto var(--sp-6)' }}>
              To list artworks on the COVEN market, you must first register your Torn artist profile, set your specialization, and verify your credentials.
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center' }}>
              <Link to="/register-artist" className="btn btn-primary">
                Register as Artist →
              </Link>
              <Link to="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <StepIndicator />

            {/* ── STEP 1: UPLOAD ─────────────────────────────────── */}
            {step === 'upload' && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${preview ? 'var(--term-green)' : 'var(--hull)'}`,
                padding: 'var(--sp-12)',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--plate)',
                position: 'relative',
                transition: 'border-color 0.2s',
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" style={{ maxHeight: 320, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setUpload(null); }}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'var(--red)', color: 'white', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} weight="bold" />
                  </button>
                </>
              ) : (
                <>
                  <UploadSimple size={40} color="var(--hull)" weight="thin" />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--ghost)', marginTop: 'var(--sp-4)' }}>
                    DRAG & DROP OR CLICK
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--shadow-type)', marginTop: 'var(--sp-2)' }}>
                    PNG, JPG, WEBP — max 10MB
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            </div>

            <UploadBar />

            {error && (
              <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)', borderLeft: '2px solid var(--red)', background: 'rgba(230,25,25,0.06)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Warning size={14} color="var(--red-hi)" weight="fill" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)' }}
                onClick={handleUpload}
                disabled={!file || (upload != null && !upload.done)}
              >
                {upload && !upload.done ? `UPLOADING ${upload.percent}%` : 'UPLOAD IMAGE →'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: 'var(--term-green)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: 'var(--sp-4)',
                }}
                onClick={handleUseSample}
              >
                <Sparkle size={14} weight="bold" /> USE SAMPLE ARTWORK
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: DETAILS ────────────────────────────────── */}
        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            {/* Title */}
            <div>
              <label htmlFor="art-title" className="form-label">Artwork Title *</label>
              <input id="art-title" type="text" className="form-input" placeholder="E.g. VOID WALKER III" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="art-desc" className="form-label">Description</label>
              <textarea
                id="art-desc"
                className="form-input"
                rows={4}
                placeholder="Describe the artwork, process, or inspiration..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}
                maxLength={600}
              />
            </div>

            {/* Listing type */}
            <div>
              <div className="form-label">Listing Type *</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
                {(['fixed', 'auction', 'commission'] as ListingType[]).map((lt) => (
                  <button
                    key={lt}
                    onClick={() => setListingType(lt)}
                    style={{
                      padding: 'var(--sp-4)',
                      background: listingType === lt ? 'var(--void)' : 'var(--plate)',
                      borderBottom: listingType === lt ? '2px solid var(--red)' : '2px solid transparent',
                      fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: listingType === lt ? 'var(--phosphor)' : 'var(--ghost)',
                      cursor: 'pointer',
                    }}
                  >
                    {lt === 'fixed' ? 'Fixed Price' : lt === 'auction' ? 'Auction' : 'Commission'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price / Auction end */}
            {listingType === 'fixed' && (
              <div>
                <label htmlFor="art-price" className="form-label">Price (Torn Cash) *</label>
                <input id="art-price" type="text" className="form-input" placeholder="50000" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            )}
            {listingType === 'auction' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
                <div style={{ background: 'var(--void)', padding: 'var(--sp-4)' }}>
                  <label htmlFor="art-start-bid" className="form-label">Starting Bid</label>
                  <input id="art-start-bid" type="text" className="form-input" placeholder="10000" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div style={{ background: 'var(--void)', padding: 'var(--sp-4)' }}>
                  <label htmlFor="art-auction-end" className="form-label">Auction End</label>
                  <input id="art-auction-end" type="datetime-local" className="form-input" value={auctionEnd} onChange={(e) => setAuctionEnd(e.target.value)} />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <div className="form-label">Tags (max 5)</div>
              <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', background: 'var(--seam)' }}>
                {TAGS_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`chip${selectedTags.includes(t) ? ' active' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* NSFW toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)', border: '1px solid var(--hull)', background: 'var(--plate)' }}>
              <input
                id="art-nsfw"
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => setIsNsfw(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--red)', cursor: 'pointer' }}
              />
              <label htmlFor="art-nsfw" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', cursor: 'pointer' }}>
                Mark as 18+ / NSFW content
              </label>
            </div>

            {error && (
              <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderLeft: '2px solid var(--red)', background: 'rgba(230,25,25,0.06)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>
                ✗ {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)' }} onClick={() => setStep('upload')}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)' }}
                onClick={() => { if (!title.trim()) { setError('Title is required'); return; } setError(null); setStep('preview'); }}
              >
                Preview →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PREVIEW ────────────────────────────────── */}
        {step === 'preview' && imageUrl && (
          <div>
            {/* Watermark Protection Bar */}
            <div style={{
              background: 'var(--pit)',
              border: '1px solid var(--seam)',
              padding: '10px 16px',
              marginBottom: 'var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--term-green)" weight="bold" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--phosphor)', letterSpacing: '0.1em' }}>
                  ANTI-THEFT WATERMARK ENCRYPTION ENABLED
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                  STENCIL:
                </span>
                {WATERMARK_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setWatermarkStyle(p.id)}
                    style={{
                      background: watermarkStyle === p.id ? 'var(--red)' : 'var(--plate)',
                      color: watermarkStyle === p.id ? '#fff' : 'var(--ghost)',
                      border: '1px solid var(--seam)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5625rem',
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWatermarkPreview(!watermarkPreview)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--hull)',
                    color: watermarkPreview ? 'var(--phosphor)' : 'var(--ghost)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    marginLeft: '8px',
                  }}
                >
                  {watermarkPreview ? 'VIEW: PROTECTED' : 'VIEW: CLEAN'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--seam)', marginBottom: 'var(--sp-6)' }}>
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--void)' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {watermarkPreview && (
                  <WatermarkOverlay
                    style={watermarkStyle}
                    artistName="YOUR_ARTIST_TAG"
                    artworkId="PREVIEW"
                    opacity={WATERMARK_PRESETS.find(p => p.id === watermarkStyle)?.opacity ?? 0.35}
                  />
                )}
              </div>
              <div style={{ background: 'var(--plate)', padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', lineHeight: 0.95 }}>
                  {title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', textTransform: 'uppercase' }}>
                  {listingType} / {price ? `$${parseInt(price, 10).toLocaleString()}` : 'Open'}
                </div>
                {description && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.7 }}>{description}</p>
                )}
                <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap', background: 'var(--seam)', marginTop: 'auto' }}>
                  {selectedTags.map((t) => <span key={t} className="badge badge-edition">#{t}</span>)}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)', borderLeft: '2px solid var(--red)', background: 'rgba(230,25,25,0.06)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--red-hi)' }}>
                ✗ {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--seam)' }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)' }} onClick={() => setStep('details')}>
                ← Edit
              </button>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)', borderBottom: '2px solid var(--hull)' }}
                onClick={() => handleSave(false)}
                disabled={submitting}
              >
                Save Draft
              </button>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', borderRadius: 0, padding: 'var(--sp-4)' }}
                onClick={() => handleSave(true)}
                disabled={submitting}
              >
                {submitting ? 'PUBLISHING...' : 'PUBLISH →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: DONE ───────────────────────────────────── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
            <CheckCircle size={48} color="var(--term-green)" weight="fill" style={{ margin: '0 auto var(--sp-6)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--phosphor)', marginBottom: 'var(--sp-4)' }}>
              LISTED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', marginBottom: 'var(--sp-8)' }}>
              Your artwork is now live on the market.
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
              {artworkId && (
                <button onClick={() => navigate(`/artwork/${artworkId}`)} className="btn btn-industrial">
                  View Listing
                </button>
              )}
              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                Dashboard
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </main>
  );
}
