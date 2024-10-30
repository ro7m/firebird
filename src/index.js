import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MedicalTranscription from './components/MedicalTranscription';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MedicalTranscription />
  </React.StrictMode>
);
