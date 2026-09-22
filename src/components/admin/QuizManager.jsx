'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uid, NEET_SUBJECTS, NEET_SUBJECT_LABELS } from '../../lib/utils';
import { resolveCorrectKey, normalizeOptions } from '../../lib/examEngine';

const EMPTY = { subject: 'physics', en: '', bn: '', a: '', b: '', c: '', d: '', correct: 'A', exp: '' };

// Replaces the original GK-only Quick Quiz uploader — NEET has no "GK" subject, so the Quick
// Quiz pool is now shared across all 4 NEET subjects (Physics/Chemistry/Botany/Zoology) and
// each question is tagged with its subject so Quiz.jsx can draw a fair mix.
export default function QuizManager() {
  const { DB, saveDB } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [bulkSubject, setBulkSubject] = useState('physics');
  const [bulkJson, setBulkJson] = useState('');

  const quizQuestions = DB.quizPool.filter((q) => NEET_SUBJECTS.includes(q.subject));

  const addQuizQuestion = () => {
    const { subject, en, bn, a, b, c, d, correct, exp } = form;
    if (!en.trim() || !a.trim() || !b.trim() || !c.trim() || !d.trim()) { alert('Please fill the question and all 4 options.'); return; }
    const q = { id: uid('q'), subject, section: 'A', questionType: 'mcq', textEn: en.trim(), textBn: bn.trim(), options: [{ key: 'A', textEn: a.trim(), textBn: '' }, { key: 'B', textEn: b.trim(), textBn: '' }, { key: 'C', textEn: c.trim(), textBn: '' }, { key: 'D', textEn: d.trim(), textBn: '' }], correct, explanation: exp.trim(), solutionImg: '', image: '' };
    saveDB((prev) => ({ ...prev, quizPool: [...prev.quizPool, q] }));
    setForm({ ...EMPTY, subject });
  };

  const bulkUploadQuiz = () => {
    try {
      const arr = JSON.parse(bulkJson.trim());
      // Accepts a few common alternate field names for the options list (some JSON generators
      // use "choices" or "answerOptions" instead of "options") and normalizes whatever shape
      // they're in (array of strings, object keyed by letter, etc.) into the canonical form
      // BEFORE saving.
      const newQs = arr.map((q) => {
        const rawOptions = q.options || q.choices || q.answerOptions || q.answers;
        const options = normalizeOptions(rawOptions);
        const withOptions = { ...q, options };
        return { id: uid('q'), subject: NEET_SUBJECTS.includes(q.subject) ? q.subject : bulkSubject, section: 'A', questionType: 'mcq', textEn: q.textEn || q.text || q.question || '', textBn: q.textBn || '', options, correct: resolveCorrectKey(withOptions), explanation: q.explanation || '', solutionImg: q.solutionImg || '', image: q.image || '' };
      });
      const skipped = newQs.filter((q) => !q.textEn || q.options.length < 2).length;
      saveDB((prev) => ({ ...prev, quizPool: [...prev.quizPool, ...newQs] }));
      setBulkJson('');
      if (skipped > 0) alert(`Uploaded ${newQs.length} questions, but ${skipped} of them are missing question text or at least 2 options — you may want to check and re-upload those specific ones.`);
    } catch (e) { alert('Invalid JSON: ' + e.message); }
  };

  const deleteQuizQuestion = (qid) => {
    if (!confirm('Delete this quiz question?')) return;
    saveDB((prev) => ({ ...prev, quizPool: prev.quizPool.filter((q) => q.id !== qid) }));
  };

  // One-tap repair for questions already saved before this fix existed: re-normalizes every
  // quiz question's options in place (handles options that got saved as plain strings, an
  // object keyed by letter, or under a differently-named field) without deleting anything.
  const repairAllQuizQuestions = () => {
    if (!quizQuestions.length) return;
    if (!confirm(`Attempt to repair answer options for all ${quizQuestions.length} quiz questions? This will not delete anything.`)) return;
    saveDB((prev) => ({
      ...prev,
      quizPool: prev.quizPool.map((q) => {
        if (!NEET_SUBJECTS.includes(q.subject)) return q;
        if (Array.isArray(q.options) && q.options.length >= 2 && q.options.every((o) => o && o.key && (o.textEn || o.textBn))) return q; // already fine
        const rawOptions = q.options || q.choices || q.answerOptions || q.answers;
        const options = normalizeOptions(rawOptions);
        return { ...q, options, correct: resolveCorrectKey({ ...q, options }) };
      }),
    }));
    alert('Repair attempted. Scroll down to check the "Options" preview under each question below to confirm.');
  };

  const deleteAllQuizQuestions = () => {
    if (!quizQuestions.length) return;
    if (!confirm(`Delete ALL ${quizQuestions.length} quiz questions? This cannot be undone.`)) return;
    if (!confirm('Are you absolutely sure? This will permanently wipe the entire quiz pool right now.')) return;
    saveDB((prev) => ({ ...prev, quizPool: prev.quizPool.filter((q) => !NEET_SUBJECTS.includes(q.subject)) }));
  };

  return (
    <div>
      <div className="card2 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold muted uppercase mb-1">Quiz Duration — Automatic</p>
        <p className="text-[11px] muted">Timer is calculated automatically (~30 seconds per question) whenever a student starts a quiz — no manual setup needed here.</p>
      </div>

      <div className="card2 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold muted uppercase mb-2">Upload Quiz Question — Single Entry</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-lg px-3 py-2 text-xs">
            {NEET_SUBJECTS.map((s) => <option key={s} value={s}>{NEET_SUBJECT_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <textarea value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} rows={2} placeholder="Question (English)" className="rounded-lg px-3 py-2 text-xs" />
          <textarea value={form.bn} onChange={(e) => setForm({ ...form, bn: e.target.value })} rows={2} placeholder="প্রশ্ন (বাংলা) — optional" className="rounded-lg px-3 py-2 text-xs bn" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} type="text" placeholder="Option A" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.b} onChange={(e) => setForm({ ...form, b: e.target.value })} type="text" placeholder="Option B" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.c} onChange={(e) => setForm({ ...form, c: e.target.value })} type="text" placeholder="Option C" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.d} onChange={(e) => setForm({ ...form, d: e.target.value })} type="text" placeholder="Option D" className="rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <select value={form.correct} onChange={(e) => setForm({ ...form, correct: e.target.value })} className="rounded-lg px-3 py-2 text-xs">
            <option>A</option><option>B</option><option>C</option><option>D</option>
          </select>
          <input value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} type="text" placeholder="Explanation" className="rounded-lg px-3 py-2 text-xs" />
        </div>
        <button onClick={addQuizQuestion} className="btn-gold rounded-lg px-4 py-2 text-xs font-bold">+ Add to Quiz Pool</button>
      </div>

      <div className="card2 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold muted uppercase mb-2">Bulk Copy-Paste Upload (JSON array)</p>
        <div className="mb-2">
          <label className="text-[11px] font-bold muted uppercase block mb-1">Default subject for entries without one</label>
          <select value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} className="rounded-lg px-3 py-2 text-xs">
            {NEET_SUBJECTS.map((s) => <option key={s} value={s}>{NEET_SUBJECT_LABELS[s]}</option>)}
          </select>
        </div>
        <textarea value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} rows={4} placeholder='[{"subject":"physics","textEn":"...","options":[{"key":"A","textEn":"..."},...],"correct":"A","explanation":"..."}]' className="w-full rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={bulkUploadQuiz} className="btn-gold rounded-lg px-4 py-2 text-xs font-bold mt-2">Upload Bulk to Quiz Pool</button>
      </div>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-xs font-bold muted uppercase">Quiz Pool ({quizQuestions.length} questions)</p>
        {quizQuestions.length > 0 && (
          <div className="flex gap-2">
            <button onClick={repairAllQuizQuestions} className="rounded-lg px-3 py-1.5 text-[11px] font-bold btn-gold">Repair Options for All Questions</button>
            <button onClick={deleteAllQuizQuestions} className="rounded-lg px-3 py-1.5 text-[11px] font-bold bg-red-600 text-white flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete All Quiz Questions</button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {quizQuestions.map((q, i) => {
          const opts = Array.isArray(q.options) ? q.options : [];
          const broken = opts.length < 2;
          return (
            <div key={q.id} className={`card rounded-lg p-3 flex justify-between items-start gap-3 ${broken ? 'ring-1 ring-red-500' : ''}`}>
              <div className="min-w-0">
                <span className="badge bg-sky-500/15 text-sky-400 mb-1 inline-block">{NEET_SUBJECT_LABELS[q.subject] || q.subject}</span>
                <p className="text-xs font-medium">{i + 1}. {q.textEn}</p>
                <p className="text-[10px] muted mt-1">Correct: {q.correct}</p>
                {broken ? (
                  <p className="text-[10px] text-red-400 mt-1">⚠ No usable answer options saved for this question — try "Repair Options for All Questions" above.</p>
                ) : (
                  <p className="text-[10px] muted mt-1">Options: {opts.map((o) => `${o.key}) ${o.textEn}`).join('   ')}</p>
                )}
              </div>
              <button onClick={() => deleteQuizQuestion(q.id)} className="text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
