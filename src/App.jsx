import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import FriendsGallery from './components/FriendsGallery';
import GroupChat from './components/GroupChat';
import FollowUs from './components/FollowUs';
import Footer from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-main">
      {/* Dynamic Ambient Mesh Gradient Orbs */}
      <div className="ambient-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Floating Glass iOS Navigation Bar */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
      />

      {/* Main Single Page Content Container */}
      <main className="app-container">
        <Hero 
          onExplore={() => scrollToSection('about')} 
          onMeetFriends={() => scrollToSection('friends')} 
        />
        
        <About />
        
        <FriendsGallery />

        <GroupChat />
        
        <FollowUs />
        
        <Footer onScrollTop={() => scrollToSection('hero')} />
      </main>
    </div>
  );
}
