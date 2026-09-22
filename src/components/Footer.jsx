'use client';

import React from 'react';
import { Globe, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS } from '../lib/utils';

export default function Footer() {
  const { DB, setTab, openModal } = useApp();
  return (
    <footer className="mt-10" style={{ borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg gold-grad flex items-center justify-center font-display font-800 text-ink">T</div>
            <span className="font-display font-800">TCE - NEET</span>
          </div>
          <p className="muted text-sm">Dedicated coaching platform for NEET UG — Physics, Chemistry, Botany &amp; Zoology mock tests, PYQs, quizzes and study materials.</p>
          <p className="text-xs gold-text font-semibold mt-2 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Update your domain in Footer.jsx</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide muted">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className="text-left muted hover:text-current text-sm">{t.label}</button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide muted">Faculty Contact</h4>
          <div className="flex flex-col gap-3 text-sm">
            {(DB.mentors || []).length ? DB.mentors.map((m) => (
              <a key={m.id} href={`https://wa.me/${m.phone}?text=Hello%2C%20I%20want%20to%20know%20more%20about%20TCE%20NEET%20classes`} target="_blank" rel="noreferrer" className="flex items-center gap-2 muted hover:text-current">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>{m.name} <span className="block text-xs">{m.subject}</span></span>
              </a>
            )) : <p className="text-xs muted">Add your faculty via Admin Panel → Mentors / Faculty.</p>}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide muted">Contact</h4>
          <p className="text-sm gold-text font-semibold flex items-center gap-2 mb-2"><Globe className="w-3.5 h-3.5" /> your-neet-institute-domain.com</p>
          <p className="text-sm muted flex items-start gap-2 mb-2"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Update your institute address in src/components/Footer.jsx</p>
          <p className="text-sm muted flex items-center gap-2 mb-2"><Phone className="w-3.5 h-3.5" /> +91 XXXXX XXXXX</p>
          <p className="text-sm muted flex items-center gap-2 mb-2"><Mail className="w-3.5 h-3.5" /> yourinstitute@example.com</p>
          <button onClick={() => openModal('adminLogin')} className="text-xs muted underline">Admin Login</button>
        </div>
      </div>
      <div className="text-center text-xs muted pb-6">© 2026 TCE - NEET. All rights reserved.</div>
    </footer>
  );
}
