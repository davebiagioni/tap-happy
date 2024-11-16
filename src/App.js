import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import 'react-calendar/dist/Calendar.css';
import './App.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState({});
  const [step, setStep] = useState('select'); // Track the current step: 'select', 'exercise', 'alcohol'
  const [isSmashing, setIsSmashing] = useState(false); // Track animation state for the happy button

  // Handle selecting a date
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setStep('select'); // Reset to selection step
    setIsModalOpen(true);
  };

  // Save the log for the selected date
  const saveLog = (type, data) => {
    setLogs((prevLogs) => ({
      ...prevLogs,
      [selectedDate.toDateString()]: {
        ...prevLogs[selectedDate.toDateString()],
        [type]: data,
      },
    }));
    setIsModalOpen(false); // Close modal after saving
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setStep('select'); // Reset the step when the modal closes
  };

  // Handle smashing the happy button
  const handleHappyButtonClick = () => {
    const sound = new Audio('/magical-sound.mp3'); // Load the magical sound
    setIsSmashing(true); // Trigger animation
    sound.play(); // Play the sound

    setTimeout(() => {
      saveLog('alcoholFree', true); // Save alcohol-free status
      setIsSmashing(false); // Reset animation state
    }, 300); // Match animation duration
  };

  // Handle back navigation for swiping or physical back button
  useEffect(() => {
    const handleBackNavigation = (event) => {
      if (isModalOpen) {
        event.preventDefault(); // Prevent exiting the app
        if (step === 'exercise' || step === 'alcohol') {
          setStep('select'); // Go back to the "select" step
        } else {
          setIsModalOpen(false); // Close the modal
        }
      }
    };

    // Attach event listener for the back button or swipe gesture
    window.history.pushState(null, '', window.location.href); // Push a dummy state
    window.addEventListener('popstate', handleBackNavigation);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [isModalOpen, step]);

  return (
    <div>
      <h1>Exercise & Alcohol-Free Tracker</h1>
      <Calendar
        onChange={handleDateClick}
        value={selectedDate}
        className="calendar"
        tileContent={({ date }) => {
          const log = logs[date.toDateString()];
      
          // Render dots conditionally for alcohol-free and exercise
          return log ? (
            <div className="react-calendar__tile-content">
              {log.alcoholFree && <div className="dot green"></div>}
              {log.exercise && <div className="dot purple"></div>}
            </div>
          ) : null;
        }}
      />
      <div className="calendar-legend">
        <div className="legend-alcohol-free">
          <span></span> Alcohol-Free
        </div>
        <div className="legend-exercise">
          <span></span> Exercise
        </div>
      </div>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Selected Date: {selectedDate.toDateString()}
      </p>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Log Activity Modal"
        style={{
          content: {
            top: '10%',
            left: '5%',
            right: '5%',
            bottom: '10%',
            backgroundColor: '#ffe4e6',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {step === 'select' && (
          <div>
            <h2 style={{ textAlign: 'center', color: '#6c63ff' }}>
              What would you like to log for {selectedDate.toDateString()}?
            </h2>
            <button
              onClick={() => setStep('exercise')}
              style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0' }}
            >
              Exercise
            </button>
            <button
              onClick={() => setStep('alcohol')}
              style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0' }}
            >
              Alcohol
            </button>
            <button
              onClick={closeModal}
              style={{ width: '100%', padding: '0.8rem', margin: '0.5rem 0' }}
            >
              Close
            </button>
          </div>
        )}

        {step === 'exercise' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const activity = e.target.activity.value;
              const duration = e.target.duration.value;
              saveLog('exercise', { activity, duration });
            }}
          >
            <h2 style={{ textAlign: 'center', color: '#6c63ff' }}>
              Log Exercise for {selectedDate.toDateString()}
            </h2>
            <label>
              Activity Type:
              <input
                name="activity"
                type="text"
                placeholder="e.g., Running, Yoga"
              />
            </label>
            <label>
              Duration (minutes):
              <input name="duration" type="number" placeholder="e.g., 30" />
            </label>
            <button type="submit" style={{ width: '75%', margin: '0 auto', display: 'block'}}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setStep('select')}
              style={{ width: '75%', marginTop: '0.5rem',  margin: '0 auto', display: 'block'}}
            >
              Back
            </button>
          </form>
        )}

        {step === 'alcohol' && (
          <div>
            <h2 style={{ textAlign: 'center', color: '#6c63ff' }}>
              Mark {selectedDate.toDateString()} as Alcohol-Free!
            </h2>
            <button
              className={`happy-button ${isSmashing ? 'smash-animation' : ''}`}
              style={{ width: '100%', marginTop: '0.5rem', margin: '0 auto', display: 'block' }}
              onClick={handleHappyButtonClick}
            >
              SMASH!
            </button>
            <button
              type="button"
              onClick={() => setStep('select')}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Back
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
