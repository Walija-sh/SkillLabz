import React from 'react';
import { motion } from 'framer-motion';

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function ToolCard({ item }) {
  const imageUrl = item.images?.[0]?.url || item.images?.[0] || item.image || null;
  const title = item.title || item.name || 'Untitled Tool';
  const location = item.location?.city || item.city || '';
  const price = item.pricePerDay ?? item.price ?? null;
  
  // Skill Session Logic updated to match the backend variable 'offerSkillSession'
  const hasSkillSession = item.offerSkillSession === true || item.offerSkillSession === 'true' || item.skillSessionEnabled || item.hasSkillSession || item.skillSession;
  
  // Owner Avatar Logic
  const owner = item.owner || {};
  const ownerName = owner.fullName || owner.name || owner.firstName || 'User';
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const ownerAvatar = owner.profileImage?.url || null;

  return (
    <motion.div
      className="flex flex-col h-full bg-white cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -6, 
        boxShadow: '0px 14px 30px rgba(25, 25, 112, 0.12)',
        borderColor: 'rgba(25, 25, 112, 0.1)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #F1F5F9',
      }}
    >
      {/* ── Image ── */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F8FAFC', overflow: 'hidden' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Skill Session Badge */}
        {hasSkillSession && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#191970', color: '#fff',
            fontSize: '10px', fontWeight: '700', letterSpacing: '0.02em',
            padding: '5px 10px', borderRadius: '20px',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 2px 8px rgba(25, 25, 112, 0.3)'
          }}>
            Session Available
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>

        {/* Title + Price row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: '700',
            color: '#1A1A2E',
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}>
            {title}
          </h3>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {price !== null ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: '800', color: '#191970',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}>
                  Rs. {price}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600', color: '#475569', 
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  / day
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>POA</span>
            )}
          </div>
        </div>

        {/* Avatar + Location row (Bottom) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          marginTop: 'auto', paddingTop: '4px'
        }}>
          
          {/* Left: Owner Avatar */}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', 
            backgroundColor: '#191970', color: '#ffffff', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0,
            border: '2px solid #F8FAFC'
          }} title={ownerName}>
            {ownerAvatar ? (
              <img src={ownerAvatar} alt={ownerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{ownerInitial}</span>
            )}
          </div>

          {/* Right: Location in Theme Color */}
          {location && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: '#191970', fontSize: '11px', fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
              overflow: 'hidden',
              minWidth: 0,
            }}>
              <MapPinIcon />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {location}
              </span>
            </span>
          )}

        </div>
      </div>
    </motion.div>
  );
}