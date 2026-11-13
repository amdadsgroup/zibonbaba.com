import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
          borderRadius: '8px',
          color: '#0F172A',
          fontSize: '22px',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
