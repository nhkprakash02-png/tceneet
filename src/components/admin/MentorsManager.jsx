'use client';

import React, { useState } from 'react';
import { ImageUp, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uid } from '../../lib/utils';

// Faculty/mentor management for this NEET template. Unlike the old project, no instructor
// photos or names ship pre-loaded here — this is the "designated place to upload your new
// NEET instructor photos" the client asked for. Photos are compressed client-side into Base64
// and stored directly on Firestore (same approach as student profile photos in lib/imageUtils.js),
// so no Firebase Storage bucket is required and the project stays on the free Spark plan.
export default function MentorsManager() {
  const { DB, saveDB } = useApp();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState(null);

  const addMentor = () => {
    if (!name.trim()) { alert('Please enter the mentor/faculty name.'); return; }
    const finalize = (photoSrc) => {
      const mentor = { id: uid('mn'), name: name.trim(), subject: subject.trim() || 'Faculty', phone: phone.trim().replace(/\D/g, ''), photo: photoSrc || '' };
      saveDB((prev) => ({ ...prev, mentors: [...(prev.mentors || []), mentor] }));
      setName(''); setSubject(''); setPhone(''); setFile(null);
    };
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please choose a valid image file (JPG, PNG, GIF, WEBP).'); return; }
      if (file.size > 2 * 1024 * 1024) { alert('That photo is larger than 2MB — please choose a smaller image.'); return; }
      const reader = new FileReader();
      reader.onload = (e) => finalize(e.target.result);
      reader.onerror = () => alert('Could not read the selected image. Please try a different file.');
      reader.readAsDataURL(file);
    } else {
      finalize(''); // no photo — falls back to a gold initial-letter avatar automatically
    }
  };

  const deleteMentor = (id) => {
    if (!confirm('Remove this mentor/faculty member?')) return;
    saveDB((prev) => ({ ...prev, mentors: (prev.mentors || []).filter((m) => m.id !== id) }));
  };

  return (
    <div>
      <div className="card2 rounded-xl p-4 mb-6">
        <p className="text-xs font-bold muted uppercase mb-3">Add New Mentor / Faculty</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Full Name" className="rounded-lg px-3 py-2 text-xs" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" placeholder="Subject (e.g. Physics, Botany)" className="rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="WhatsApp Number (with country code, e.g. 91XXXXXXXXXX)" className="rounded-lg px-3 py-2 text-xs" />
          <label className="btn-ghost rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <ImageUp className="w-3.5 h-3.5" /><span>{file ? file.name : 'Upload Photo (optional)'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        </div>
        <button onClick={addMentor} className="btn-gold rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />+ Add Mentor</button>
        <p className="text-[11px] muted mt-2">No photo required — a gold initial-letter avatar is shown automatically if you leave it blank.</p>
      </div>

      <p className="text-xs font-bold muted uppercase mb-2">Current Mentors ({(DB.mentors || []).length})</p>
      <div className="space-y-2">
        {(DB.mentors || []).length ? DB.mentors.map((m) => (
          <div key={m.id} className="card2 rounded-xl p-3 flex items-center gap-3">
            {m.photo ? <img src={m.photo} className="w-12 h-12 object-cover rounded-full shrink-0" alt={m.name} /> : <div className="w-12 h-12 rounded-full gold-grad shrink-0 flex items-center justify-center text-ink text-sm font-bold">{(m.name || '?')[0]}</div>}
            <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{m.name}</p><p className="text-xs muted truncate">{m.subject}{m.phone ? ' — +' + m.phone : ''}</p></div>
            <button onClick={() => deleteMentor(m.id)} className="rounded-lg px-3 py-1.5 text-[11px] font-bold bg-red-600 text-white shrink-0 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button>
          </div>
        )) : <p className="muted text-sm">No mentors added yet — add your NEET faculty above.</p>}
      </div>
    </div>
  );
}
