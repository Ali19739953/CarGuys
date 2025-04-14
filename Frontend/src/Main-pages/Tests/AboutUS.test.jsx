import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutUs from '../Aboutus';
import { vi } from 'vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAboutUs = () => {
  render(
    <BrowserRouter>
      <AboutUs />
    </BrowserRouter>
  );
};

describe('AboutUs Component', () => {
  beforeEach(() => {
    renderAboutUs();
  });

  it('renders the header with logo', () => {
    const logo = screen.getByAltText('CarGuys Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About US')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Contact US')).toBeInTheDocument();
  });

  it('renders login and signup buttons', () => {
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('navigates to login page when Login button is clicked', () => {
    fireEvent.click(screen.getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup page when Signup button is clicked', () => {
    fireEvent.click(screen.getByText('Signup'));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('renders "Partner with CarGuys" link', () => {
    expect(screen.getByText('Partner with CarGuys')).toBeInTheDocument();
  });

  it('renders main content sections', () => {
    expect(screen.getByText('About CarGuys')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('What We Do')).toBeInTheDocument();
    expect(screen.getByText('Why Choose CarGuys?')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
  });

  it('renders content for car owners', () => {
    expect(screen.getByText(/For Car Owners:/)).toBeInTheDocument();
  });

  it('renders content for garage owners', () => {
    expect(screen.getByText(/For Garage Owners:/)).toBeInTheDocument();
  });

  it('renders footer content', () => {
    expect(screen.getByText(/Trust CarGuys with your vehicle/)).toBeInTheDocument();
  });

  it('renders all list items in "Why Choose CarGuys?" section', () => {
    expect(screen.getByText('Reliable Network:')).toBeInTheDocument();
    expect(screen.getByText('Convenience:')).toBeInTheDocument();
    expect(screen.getByText('Transparency:')).toBeInTheDocument();
    expect(screen.getByText('Personalized Care:')).toBeInTheDocument();
  });
});