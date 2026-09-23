import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import PublicNavbar from '../components/PublicNavbar';
import './public-pages.css';
import laptopImage from '../assets/img/kk.jpg'

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="page-container landing-page">
      <PublicNavbar />

      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">Smart financing for learners</span>
          <h1 className="hero-title">Access the right laptop without the stress.</h1>
          <p className="hero-description">
            Empower your studies with flexible laptop financing, transparent payments,
            and a simplified application process built for students and institutions.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="cta-button primary">Get Started</Link>
            <Link to="/services" className="cta-button secondary">Explore Services</Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>2K+</strong>
              <span>Applications</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>Student satisfaction</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Support access</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container">
            <img src={laptopImage} alt="Laptop Management System" className="hero-image" />
          </div>
          <div className="floating-card card-top">
            <span className="mini-label">Easy Approval</span>
            <strong>3-step process</strong>
          </div>
          <div className="floating-card card-bottom">
            <span className="mini-label">Flexible Plans</span>
            <strong>Pay in installments</strong>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <span className="eyebrow">Why students choose us</span>
          <h2>Built for easy access and peace of mind.</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick application</h3>
            <p>Apply online in minutes and get guided through each step of your financing journey.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Flexible payments</h3>
            <p>Track every installment and plan your budget with clear payment visibility.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Reliable delivery</h3>
            <p>Stay updated from approval to payment completion and laptop handover.</p>
          </div>
        </div>
      </section>
    </div>
  );
}