

import { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = "RevModz";
  }, []);

  return (
    <div className="App">
      {/* Logo */}
      <header>
        <a href="https://your-website.com" target="_blank" rel="noopener noreferrer">
          <img src={logo} alt="RevModz Logo" className="logo" />
        </a>
      </header>

      {/* Website Name */}
      <h1>RevModz</h1>

      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          count is {count}
        </button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>

      <p className="read-the-docs">Click on the logo to learn more</p>
    </div>
  );
}

export default App;
