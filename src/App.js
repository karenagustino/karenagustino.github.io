import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Works from './components/Works';
import Projects from './components/Projects';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Resume />
      <Works />
      <Projects />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default App;
