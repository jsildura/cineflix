import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>About CineFlix</h1>

        <div className="about-content">
          <section className="about-section">
            <h2>Welcome to CineFlix</h2>
            <p>
              Welcome to CineFlix, your favorite destination for exploring the vast world of Movies and TV shows.
              Our mission is to provide an elegant and user-friendly interface for discovering new content,
              tracking trending titles, and enjoying a seamless viewing experience.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Technology</h2>
            <p>
              This project was built using modern web technologies including React.js, Vite, and Cloudflare Pages
              to demonstrate a responsive and dynamic front-end application. We source our data from The Movie Database (TMDB)
              API to ensure up-to-date and accurate information about movies and TV shows.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Commitment</h2>
            <p>
              We are committed to providing the best user experience while respecting content creators.
              We encourage our users to support the entertainment industry by watching content through
              official platforms and services.
            </p>
            <p>
              CineFlix is developed as a demonstration of modern web development practices and is intended
              for educational and entertainment purposes.
            </p>
          </section>

          <section className="about-section contact-section">
            <h2>Get In Touch</h2>
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <div className="contact-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github git-icon" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </svg>
              <span>GitHub: <a href="" target="_blank" rel="noopener noreferrer"></a></span>
            </div>
          </section>
        </div>

        <div className="static-links">
          <Link to="/disclaimer" className="static-link">View Disclaimer</Link>
          <Link to="/" className="static-link">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default About;