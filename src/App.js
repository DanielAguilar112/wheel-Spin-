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
  const [isSpinning, setIsSpinning] = useState(false);

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
    if (isSpinning) return;
    // 1. Pick a random target segment first, then calculate the rotation to land on it
    const winningIndex = Math.floor(Math.random() * items.length);
    const segmentDegrees = 360 / items.length;

    // Calculate the angle of the winning segment's center
    const segmentCenter = winningIndex * segmentDegrees + segmentDegrees / 2;

    // We want the pointer (at 0deg / top) to align with segmentCenter.
    // The wheel rotates clockwise, so we need to rotate it so that
    // segmentCenter ends up at the top (0deg).
    const targetAngle = 360 - segmentCenter;

    // Add enough full rotations (10) so it feels fast immediately, easeOut handles deceleration
    const newRotation = rotation - (rotation % 360) + targetAngle + 360 * 10;

    setRotation(newRotation);
    setWinner(null);
    setShowModal(false);
    setIsSpinning(true);

    // 2. Wait for the 4-second animation to finish + 200ms buffer, then reveal winner
    setTimeout(() => {
      setWinner(items[winningIndex]);
      setShowModal(true);
      setIsSpinning(false);

      // --- SIDE CANNON CONFETTI ---
      const end = Date.now() + (2 * 1000); 

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: COLORS,
          zIndex: 2000 
        });

        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: COLORS,
          zIndex: 2000 
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }, 4200); 
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
          transition={{ duration: 4, ease: "easeOut" }}
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

      <button onClick={spinWheel} className="spin-button" disabled={isSpinning} style={{ opacity: isSpinning ? 0.5 : 1, cursor: isSpinning ? 'not-allowed' : 'pointer' }}>SPIN</button>

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