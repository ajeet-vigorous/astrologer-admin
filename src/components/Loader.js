import React from 'react';
import './Loader.css';

const Loader = ({ fullPage, text, size = 'default' }) => {
  const sizeClass = `loader-${size}`;

  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="loader-content">
          <div className={`loader-spinner ${sizeClass}`}>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className="loader-content">
        <div className={`loader-spinner ${sizeClass}`}>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
        {text && <p className="loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
