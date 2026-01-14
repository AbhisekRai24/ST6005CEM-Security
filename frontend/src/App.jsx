// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>RevModz</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { useState, useEffect } from 'react';
import logo from './assets/logo.png'; // Place logo here
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = "RevModz"; // Tab title
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
