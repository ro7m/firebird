// ./ui/alert.jsx
import React from 'react';

export const Alert = ({ variant, children, className }) => (
  <div className={`alert alert-${variant} ${className || ''}`}>
    {children}
  </div>
);

export const AlertTitle = ({ children }) => (
  <h3 className="alert-title font-semibold">{children}</h3>
);

export const AlertDescription = ({ children }) => (
  <p className="alert-description">{children}</p>
);
