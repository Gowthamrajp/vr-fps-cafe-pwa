import { useState, useEffect } from 'preact/hooks';

export default function ProfileImage({ 
  src, 
  alt = "Profile", 
  size = "40px", 
  className = "",
  fallback = "👤"
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setImageError(true);
      return;
    }

    // Check if image is already cached
    const cacheKey = `profile_img_${src}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      setCachedSrc(cached);
      setImageLoaded(true);
      return;
    }

    // Preload the image
    const img = new Image();
    img.onload = () => {
      // Cache the image URL
      sessionStorage.setItem(cacheKey, src);
      setCachedSrc(src);
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    
    img.src = src;
  }, [src]);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    border: '2px solid #e2e8f0',
    position: 'relative'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease'
  };

  const fallbackStyle = {
    fontSize: size === '40px' ? '1.2rem' : 
              size === '60px' ? '1.8rem' : 
              size === '120px' ? '3rem' : '1.5rem',
    color: '#64748b'
  };

  if (imageError || !src) {
    return (
      <div className={`profile-image ${className}`} style={containerStyle}>
        <span style={fallbackStyle}>{fallback}</span>
      </div>
    );
  }

  return (
    <div className={`profile-image ${className}`} style={containerStyle}>
      {!imageLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
      
      {cachedSrc && (
        <img
          src={cachedSrc}
          alt={alt}
          style={{
            ...imageStyle,
            opacity: imageLoaded ? 1 : 0
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 