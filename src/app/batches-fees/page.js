import React from 'react';
import Batches from '../../views/Batches';

export const metadata = {
  title: 'Batches & Fees — Direct Enrollment | TCE - NEET',
  description: 'Browse TCE - NEET batches and enroll instantly via UPI.',
  alternates: { canonical: '/batches-fees' },
};

export default function Page() {
  return <Batches />;
}
