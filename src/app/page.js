import React from 'react';
import Home from '../views/Home';

export const metadata = {
  title: 'TCE - NEET | Online NEET Mock Test & Coaching Portal',
  description: 'TCE - NEET: full-length NEET UG mock tests (Physics, Chemistry, Botany, Zoology), PYQs, quizzes and study material, all following the official NEET pattern and marking scheme.',
  alternates: { canonical: '/' },
};

export default function Page() {
  return <Home />;
}
