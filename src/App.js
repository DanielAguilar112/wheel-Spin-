import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
  const COLORS = [
    '#6c5ce7', '#ff7675', '#fdcb6e', '#00b894', 
    '#0984e3', '#e84393', '#fd79a8', '#55efc4'
  ];
  
  const initialData = {
    Location: ['Park', 'Beach', 'Mall', 'Movies'],
    Food: ['Pizza', 'Burgers', 'Sushi', 'Tacos'],
    Events: ['Bowling', 'Karaoke', 'Hiking', 'Gaming']
  };

  // State Management
  const [allWheels, setAllWheels] = useState(() => {
    const saved = localStorage.getItem('myWheels');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [activeCategory, setActiveCategory] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('myWheels', JSON.stringify(allWheels));
  }, [allWheels]);

  const items = activeCategory ? allWheels[activeCategory] : [];

  const addOption = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setAllWheels({ ...allWheels, [activeCategory]: [...items, newItem] });
      setNewItem('');
    }
  };

  const removeItem = (index) => {
    setAllWheels({ ...allWheels, [activeCategory]: items.filter((_, i) => i !== index) });
  };

  const addNewCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim() && !allWheels[newCategoryName]) {
      setAllWheels({ ...allWheels, [newCategoryName]: [] });
      setNewCategoryName('');
    }
  };

  const deleteCategory = (e, categoryToDelete) => {
    e.stopPropagation();
    const updatedWheels = { ...allWheels };
    delete updatedWheels[categoryToDelete];
    setAllWheels(updatedWheels);
  };

  const spinWheel = () => {
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);
    setWinner(null);
    setShowModal(false);

    setTimeout(() => {
      const actualDegrees = newRotation % 360;
      const segmentDegrees = 360 / items.length;
      const winningIndex = Math.floor((360 - actualDegrees) / segmentDegrees) % items.length;
      const finalWinner = items[winningIndex];
      
      setWinner(finalWinner);
      setShowModal(true);

      // --- SIDE CANNON CONFETTI ---
      const end = Date.now() + (2 * 1000); // Fire for 2 seconds

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 }, // Left side
          colors: COLORS,
          zIndex: 2000 // Puts it ABOVE the modal
        });

     confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 }, // Right side
          colors: COLORS,
          zIndex: 2000 // Puts it ABOVE the modal
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }, 4000);
  };

  // POP-UP COMPONENT
  const WinnerModal = () => (
    <div className="modal-overlay">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="modal-content"
      >
        <h1 style={{ color: '#fff' }}>🎉 WINNER! 🎉</h1>
        <h2 style={{ fontSize: '3rem', margin: '20px 0', color: '#6c5ce7' }}>{winner}</h2>
        <button className="close-modal-btn" onClick={() => setShowModal(false)}>
          Awesome!
        </button>
      </motion.div>
    </div>
  );

  // DASHBOARD VIEW
  if (!activeCategory) {
    return (
      <div className="container">
        <h1 style={{ color: 'white' }}>My Wheels</h1>
        <form onSubmit={addNewCategory} className="add-category-form">
          <input 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)} 
            placeholder="New wheel name..." 
          />
          <button type="submit" className="spin-button" style={{ padding: '10px 20px', fontSize: '14px' }}>
            + Create
          </button>
        </form>
        <div className="dashboard">
          {Object.keys(allWheels).map(cat => (
            <div key={cat} className="category-card-wrapper">
              <button className="delete-category-btn" onClick={(e) => deleteCategory(e, cat)}>✕</button>
              <div className="category-card" onClick={() => setActiveCategory(cat)}>{cat}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // WHEEL VIEW
  return (
    <div className="container">
      <AnimatePresence>
        {showModal && winner && <WinnerModal />}
      </AnimatePresence>

      <button className="back-button" onClick={() => {setActiveCategory(null); setWinner(null); setShowModal(false);}}>
        ← Back
      </button>
      <h1 style={{ color: 'white' }}>{activeCategory} Wheel</h1>
      
      <div className="wheel-container">
        <div className="pointer">📍</div>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', duration: 4, bounce: 0.1 }}
          className="wheel"
          style={{
            background: `conic-gradient(${items.map((_, i) => 
              `${COLORS[i % COLORS.length]} ${(i * 360) / items.length}deg ${((i + 1) * 360) / items.length}deg`).join(', ')})`,
          }}
        >
          {items.map((item, i) => {
            const segmentSize = 360 / items.length;
            const centerRotation = (i * segmentSize) + (segmentSize / 2);
            return (
              <div key={i} className="slice-label" style={{ transform: `translateX(-50%) rotate(${centerRotation}deg)` }}>
                <span className="label-text">{item}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <button onClick={spinWheel} className="spin-button">SPIN</button>

      <form onSubmit={addOption} style={{ marginTop: '30px' }}>
        <input 
          value={newItem} 
          onChange={(e) => setNewItem(e.target.value)} 
          placeholder="Add option..." 
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
          Add
        </button>
      </form>

      <ul className="item-list">
        {items.map((item, index) => (
          <li key={index} className="item-card">
            {item} 
            <span onClick={() => removeItem(index)} className="delete-btn" style={{ cursor: 'pointer' }}>X</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;