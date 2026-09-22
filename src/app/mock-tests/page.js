import React from 'react';
import MockTest from '../../views/MockTest';

export const metadata = {
  title: 'Mock Tests — CBT Engine | TCE - NEET',
  description: 'Official NEET pattern CBT mock tests for Physics, Chemistry, Botany and Zoology — Section A/B with +4/-1 marking. Free demo mock in every subject, full series for enrolled batch students.',
  alternates: { canonical: '/mock-tests' },
};

export default function Page() {
  return <MockTest />;
}
