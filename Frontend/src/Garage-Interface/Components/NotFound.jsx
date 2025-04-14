// styled it here
import React from 'react';
import { Link } from 'react-router-dom';
const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      <div style={{
        fontWeight: 'bold',
        fontSize: '24px',
        color: '#333',
        textAlign: 'center',
        padding: '40px',
        borderRadius: '8px',
        backgroundColor: 'white',
        width: 'auto',  
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          margin: '0', 
          color: 'red'
        }}>404</h1>
        <p style={{ 
          fontSize: '20px', 
          margin: '10px 0' 
        }}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <p style={{ 
          fontSize: '16px', 
          margin: '10px 0', 
          color: '#555' 
        }}>
          It might have been removed, renamed, or is temporarily unavailable.
        </p>
        <Link to="/" style={{
          textDecoration: 'none',
          color: '#fff',
          backgroundColor: '#3498db',
          padding: '10px 20px',
          borderRadius: '5px',
          transition: 'background-color 0.3s',
          display: 'inline-block',
          marginTop: '20px'
        }}>
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;