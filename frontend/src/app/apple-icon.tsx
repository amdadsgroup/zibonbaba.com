import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
          color: '#0F172A',
          fontSize: '110px',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
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
