import React from 'react';
import loaderGif from '../assets/loader.png';
import '../styles/Loader.css';

export default function Loader({ size = 6 }) {
  return (
    <div className="loader-overlay">
      <img
        src={loaderGif}
        alt="Loading..."
        className="loader-image"
        style={{ width: `${size}rem` }}
      />
    </div>
  );
}