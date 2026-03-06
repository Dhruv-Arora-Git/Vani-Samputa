import React, { useEffect, useRef } from 'react';
import './About.css';

const timelineData = [
  {
    year: '1992',
    title: 'First Visit to the ISKCON Bhubaneshwar Temple',
    image: '/images/timeline/1.jpg',
  },
  {
    year: 'FEBRUARY 24TH 1994',
    title: 'Received Initiation from Gour Govinda Swami Maharaja',
    image: '/images/timeline/2.png',
  },
  {
    year: 'AUGUST 18TH 1995',
    title: 'Received Brahmana Initiation from Gurudeva',
    image: '/images/timeline/3.jpg',
  },
  {
    year: 'MARCH 20TH 2016',
    title: 'Received Sanyassa from His Holiness Radha Govinda Swami Maharaja',
    image: '/images/timeline/4.jpg',
  },
  {
    year: 'OCTOBER 14TH 2021',
    title: 'First Batch at ISKCON Bhubaneswar',
    image: '/images/timeline/5.jpg',
  },
  {
    year: 'OCTOBER 31ST 2021',
    title: 'Oath Ceremony at Gadei-girl',
    image: '/images/timeline/6.jpg',
  }
];

export default function About() {
  const itemsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = itemsRef.current;
    items.forEach((el) => { if (el) observer.observe(el); });

    return () => items.forEach((el) => { if (el) observer.unobserve(el); });
  }, []);

  return (
    <div className="about-page">

      <div className="about-hero animate-hero">
        <h1>About His Holiness Haladhara Svāmī Mahārāja</h1>
        <p>
          His Holiness was born and brought up in Odisha, India. He came into contact
          with the devotees at ISKCON Bhubaneswar temple in 1992 and was initiated in 1994,
          receiving the name Halayudha Dasa by Sri Srimad Goura Govinda Swami Maharaj.
        </p>
      </div>

      <div className="timeline-container">
        {timelineData.map((item, index) => (
          <div
            key={index}
            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
            ref={(el) => (itemsRef.current[index] = el)}
          >
            <div className="timeline-content">
              <span className="timeline-date">{item.year}</span>
              <h3 className="timeline-title">{item.title}</h3>
              <div className="timeline-image-wrapper">
                <img src={item.image} alt={item.title} className="timeline-image" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
