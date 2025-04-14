import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HomePage from '../Homepage';

// Wrapper component to provide router context
const wrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('HomePage', () => {
  it('renders the header with navigation links', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About US')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Contact US')).toBeInTheDocument();
  });

  it('renders login and signup buttons', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('renders "Partner with CarGuys" link', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('Partner with CarGuys')).toBeInTheDocument();
  });

  it('renders "TOP RATED GARAGES" section', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('TOP RATED GARAGES')).toBeInTheDocument();
    expect(screen.getAllByText(/km away/)).toHaveLength(4);
  });

  it('renders "How it works" section', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Find Garage')).toBeInTheDocument();
    expect(screen.getByText('Book a Service')).toBeInTheDocument();
    expect(screen.getByText('Get Your Car Serviced')).toBeInTheDocument();
  });

  it('renders "Words on the Streets" section', () => {
    render(<HomePage />, { wrapper });
    
    expect(screen.getByText('Words on the Streets')).toBeInTheDocument();
    expect(screen.getByText('John D.')).toBeInTheDocument();
    expect(screen.getByText('Borhan B.')).toBeInTheDocument();
    expect(screen.getByText('Alex T.')).toBeInTheDocument();
  });
});