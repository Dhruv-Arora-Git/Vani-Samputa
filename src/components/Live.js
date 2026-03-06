import React, { useState, useEffect } from 'react';
import './Live.css';

const getYouTubeVideoId = (rawUrl) => {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace('/', '');
      return id || null;
    }

    if (url.searchParams.has('v')) return url.searchParams.get('v');

    const pathMatch = url.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);
    if (pathMatch?.[2]) return pathMatch[2];
  } catch {
    // ignore
  }

  const fallback = String(rawUrl).match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|$)/);
  return fallback?.[1] || null;
};

const getEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;

  const videoId = getYouTubeVideoId(rawUrl);
  if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;

  return rawUrl;
};

function Live() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/live')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((liveData) => {
        setData(liveData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching live status:", err);
        setError("Could not load real-time status. Please check back later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="live-container">
        <div className="live-empty-state">
          <h2>Checking Live Status...</h2>
          <p>Please wait while we connect to YouTube.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-container">
        <div className="live-empty-state" style={{ color: 'red' }}>
          <h2>Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Prioritize what to show: Live > Upcoming > Latest
  let activeStream = null;
  let statusBadge = "";

  if (data?.live?.status) {
    activeStream = data.live;
    statusBadge = "🔴 LIVE NOW";
  } else if (data?.upcoming) {
    activeStream = data.upcoming;
    statusBadge = "⏱ UPCOMING";
  } else if (data?.latest) {
    activeStream = data.latest;
    statusBadge = "▶️ LATEST VIDEO";
  }

  const title = activeStream?.title || 'Live';
  const url = activeStream?.link || '';
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="live-container">
      <div className="library-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>Watch the current live / latest lecture stream</p>
        {statusBadge && (
          <div style={{ background: '#d32f2f', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
            {statusBadge}
          </div>
        )}
      </div>

      <div className="live-player-card">
        {embedUrl ? (
          <div className="live-player-frame" aria-label="Live video player">
            <iframe
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="live-empty-state">
            <h2>No Videos Found</h2>
            <p>We couldn't find any recent or live videos.</p>
          </div>
        )}

        {title && (
          <div className="live-description">
            <h2 style={{ marginTop: '0.4rem', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4a2f1a' }}>{title}</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Live;
