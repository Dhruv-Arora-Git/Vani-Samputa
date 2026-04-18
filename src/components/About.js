import React, { useState, useEffect, useRef } from 'react';
import './About.css';

const milestones = [
  {
    id: 1,
    year: '1992',
    title: 'First Visit',
    subtitle: 'ISKCON Bhubaneshwar',
    teaser: 'A profound spiritual transformation began at the feet of the deities.',
    description: 'His Holiness first visit to the ISKCON Bhubaneswar temple in 1992 marked the beginning of a profound spiritual transformation. Coming into contact with the devotees, he felt a deep calling towards the message of Srimad-Bhagavatam and the legacy of the previous Acharyas.',
    image: '/images/timeline/1.jpg',
    emoji: '🛕',
  },
  {
    id: 2,
    year: '1994',
    title: 'Initiation',
    subtitle: 'Gour Govinda Swami',
    teaser: 'Received Harinama initiation and the name Halayudha Dasa.',
    description: 'In February 1994, he received Harinama initiation from Sri Srimad Gour Govinda Swami Maharaja, receiving the name Halayudha Dasa. This formal acceptance into the Guru-parampara solidified his lifelong commitment to the mission of Sri Caitanya Mahaprabhu.',
    image: '/images/timeline/2.png',
    emoji: '🔥',
  },
  {
    id: 3,
    year: '1995',
    title: 'Brahmana',
    subtitle: 'Sacred Thread',
    teaser: 'Deepened scholarly pursuits and Vedic standards.',
    description: 'On August 18th, 1995, he received Brahmana initiation from Gurudeva. This milestone marked his entry into deeper scholarly pursuits and the responsibility of maintaining the highest standards of Vedic culture and worship.',
    image: '/images/timeline/3.jpg',
    emoji: '🧵',
  },
  {
    id: 4,
    year: '2016',
    title: 'Sanyassa',
    subtitle: 'Renounced Order',
    teaser: 'Committed fully to global traveling and preaching.',
    description: 'March 20th, 2016. He received Sanyassa from His Holiness Radha Govinda Swami Maharaja. Entering the renounced order of life, he committed himself fully to traveling and preaching the message of pure devotion globally.',
    image: '/images/timeline/4.jpg',
    emoji: '🌏',
  },
  {
    id: 5,
    year: '2021',
    title: 'Education',
    subtitle: 'First Systematic Batch',
    teaser: 'Empowering students with structured scriptural knowledge.',
    description: 'October 14th, 2021. Commencement of the first systematic batch of spiritual education at ISKCON Bhubaneswar. This initiative focused on empowering students with a deep, structured understanding of the scriptures.',
    image: '/images/timeline/5.jpg',
    emoji: '📖',
  },
  {
    id: 6,
    year: '2021',
    title: 'Oath',
    subtitle: 'Gadei-giri Legacy',
    teaser: 'Preserving the Vāṇī of the previous masters.',
    description: 'October 31st, 2021. A historic Oath Ceremony at Gadei-giri, marking a new chapter in the preservation and dissemination of the Vāṇī (words) of the previous spiritual masters.',
    image: '/images/timeline/6.jpg',
    emoji: '🕊️',
  },
];

export default function About() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const cardRefs = useRef([]);

  // Scroll-in animation observer
  useEffect(() => {
    const cards = cardRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ab-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    cards.forEach((el) => { if (el) observer.observe(el); });
    return () => cards.forEach((el) => { if (el) observer.unobserve(el); });
  }, []);

  // Escape key closes lightbox
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedItem]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="ab-page">
      {/* Hero Header */}
      <header className="ab-hero">
        <div className="ab-hero-inner">
          <span className="ab-hero-eyebrow">Life &amp; Legacy</span>
          <h1 className="ab-hero-title">Life Chapters</h1>
          <p className="ab-hero-sub">A journey of devotion, renunciation &amp; service</p>
        </div>
        <div className="ab-hero-line" />
      </header>

      {/* Cards Feed */}
      <main className="ab-feed">
        {milestones.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <article
              key={item.id}
              className="ab-card"
              ref={(el) => (cardRefs.current[index] = el)}
              style={{ '--delay': `${index * 80}ms` }}
            >
              {/* Image + Year badge */}
              <div
                className="ab-card-image"
                onClick={() => setSelectedItem(item)}
                role="button"
                aria-label={`View full story: ${item.title}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}
              >
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="ab-card-overlay" />
                <span className="ab-year-badge">{item.year}</span>
                <span className="ab-view-hint">Tap to read</span>
              </div>

              {/* Text body */}
              <div className="ab-card-body">
                <div className="ab-card-meta">
                  <span className="ab-emoji">{item.emoji}</span>
                  <div>
                    <h2 className="ab-card-title">{item.title}</h2>
                    <p className="ab-card-sub">{item.subtitle}</p>
                  </div>
                </div>

                <p className={`ab-card-teaser ${isExpanded ? 'ab-teaser-expanded' : ''}`}>
                  {item.teaser}
                </p>

                {isExpanded && (
                  <p className="ab-card-desc">{item.description}</p>
                )}

                <div className="ab-card-actions">
                  <button
                    className="ab-expand-btn"
                    onClick={(e) => toggleExpand(item.id, e)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                  <button
                    className="ab-full-btn"
                    onClick={() => setSelectedItem(item)}
                  >
                    Full story →
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="ab-lightbox"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div className="ab-lbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="ab-lbox-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="ab-lbox-img-wrap">
              <img src={selectedItem.image} alt={selectedItem.title} />
            </div>

            <div className="ab-lbox-info">
              <span className="ab-lbox-year">{selectedItem.year}</span>
              <h2 className="ab-lbox-title">{selectedItem.title}</h2>
              <p className="ab-lbox-subtitle">{selectedItem.subtitle}</p>
              <div className="ab-lbox-divider" />
              <p className="ab-lbox-desc">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer signature */}
      <footer className="ab-sig">
        <span>Haladhara Svāmī Mahārāja</span>
        <span className="ab-sig-dot">·</span>
        <span>Vāṇī Saṃpuṭa</span>
      </footer>
    </div>
  );
}
