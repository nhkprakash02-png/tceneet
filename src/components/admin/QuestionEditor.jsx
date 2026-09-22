'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, ImageUp, X } from 'lucide-react';
import { uid } from '../../lib/utils';
import { resolveCorrectKey } from '../../lib/examEngine';

const ASSERTION_REASON_OPTIONS = [
  'Both Assertion (A) and Reason (R) are true, and R is the correct explanation of A.',
  'Both Assertion (A) and Reason (R) are true, but R is NOT the correct explanation of A.',
  'Assertion (A) is true, but Reason (R) is false.',
  'Assertion (A) is false, but Reason (R) is true.',
];

const EMPTY = {
  en: '', bn: '', a: '', b: '', c: '', d: '', correct: 'A', exp: '', solimg: '',
  section: 'A', questionType: 'mcq', assertion: '', reason: '', statements: [''],
  image: '',
};

function romanize(n) { return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n - 1] || String(n); }

// Builds the final question text shown to students from whichever question-type fields are
// filled in — a plain MCQ just uses the typed question text as-is; Assertion-Reasoning and
// Statement-based questions get their structured fields composed into one readable block.
function composeQuestionText(form) {
  if (form.questionType === 'assertion-reason') {
    return `Assertion (A): ${form.assertion.trim()}\nReason (R): ${form.reason.trim()}`;
  }
  if (form.questionType === 'statement') {
    const statementLines = form.statements
      .map((s, i) => (s.trim() ? `Statement ${romanize(i + 1)}: ${s.trim()}` : ''))
      .filter(Boolean)
      .join('\n');
    return form.en.trim() ? `${form.en.trim()}\n${statementLines}` : statementLines;
  }
  return form.en.trim();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// `onChange(updater)` receives a function that maps the current `test.questions` array to the
// new one — the caller (MockManager/PyqManager) applies it via saveDB.
export default function QuestionEditor({ test, onChangeQuestions }) {
  const [form, setForm] = useState(EMPTY);
  const [bulkJson, setBulkJson] = useState('');
  const [imgBusy, setImgBusy] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleDiagramUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file (JPG, PNG, etc).'); return; }
    if (file.size > 1.5 * 1024 * 1024) { alert('Please choose an image under 1.5MB.'); return; }
    setImgBusy(true);
    try { set({ image: await readFileAsDataUrl(file) }); } finally { setImgBusy(false); }
  };

  const addQuestion = () => {
    const { a, b, c, d, correct, exp, solimg, image, section, questionType } = form;
    const textEn = composeQuestionText(form);
    if (!textEn.trim() || !a.trim() || !b.trim() || !c.trim() || !d.trim()) {
      alert(questionType === 'mcq' ? 'Please fill the question and all 4 options.' : 'Please fill the required text field(s) and all 4 options.');
      return;
    }
    const q = {
      id: uid('q'), textEn: textEn.trim(), textBn: form.bn.trim(),
      options: [{ key: 'A', textEn: a.trim(), textBn: '' }, { key: 'B', textEn: b.trim(), textBn: '' }, { key: 'C', textEn: c.trim(), textBn: '' }, { key: 'D', textEn: d.trim(), textBn: '' }],
      correct, explanation: exp.trim(), solutionImg: solimg.trim(), image: image || '',
      section, questionType,
    };
    onChangeQuestions((qs) => [...qs, q]);
    setForm(EMPTY);
  };

  const useAssertionReasonTemplate = () => {
    set({ a: ASSERTION_REASON_OPTIONS[0], b: ASSERTION_REASON_OPTIONS[1], c: ASSERTION_REASON_OPTIONS[2], d: ASSERTION_REASON_OPTIONS[3] });
  };

  const addStatementField = () => set({ statements: [...form.statements, ''] });
  const removeStatementField = (i) => set({ statements: form.statements.filter((_, idx) => idx !== i) });
  const updateStatementField = (i, val) => set({ statements: form.statements.map((s, idx) => (idx === i ? val : s)) });

  const bulkUpload = () => {
    try {
      const arr = JSON.parse(bulkJson.trim());
      const newQs = arr.map((q) => ({
        id: uid('q'), textEn: q.textEn || '', textBn: q.textBn || '', options: q.options || [],
        correct: resolveCorrectKey(q), explanation: q.explanation || '', solutionImg: q.solutionImg || '',
        image: q.image || '', section: q.section === 'B' ? 'B' : 'A', questionType: q.questionType || 'mcq',
      }));
      onChangeQuestions((qs) => [...qs, ...newQs]);
      setBulkJson('');
    } catch (e) { alert('Invalid JSON: ' + e.message); }
  };

  const editQuestion = (qid) => {
    const q = test.questions.find((x) => x.id === qid); if (!q) return;
    const en = prompt('Question text (edit the full composed text, including any Assertion/Reason or Statement lines):', q.textEn); if (en === null) return;
    const a = prompt('Option A:', q.options[0]?.textEn || ''); if (a === null) return;
    const b = prompt('Option B:', q.options[1]?.textEn || ''); if (b === null) return;
    const c = prompt('Option C:', q.options[2]?.textEn || ''); if (c === null) return;
    const d = prompt('Option D:', q.options[3]?.textEn || ''); if (d === null) return;
    const correct = prompt('Correct option (A/B/C/D):', q.correct); if (correct === null) return;
    const exp = prompt('Explanation:', q.explanation || ''); if (exp === null) return;
    const section = prompt('Section (A = mandatory, B = any 10 of 15):', q.section || 'A'); if (section === null) return;
    const image = prompt('Diagram/image URL (leave as-is or paste a new one; clear to remove):', q.image || ''); if (image === null) return;
    onChangeQuestions((qs) => qs.map((x) => (x.id === qid ? {
      ...x, textEn: en, options: [{ key: 'A', textEn: a, textBn: '' }, { key: 'B', textEn: b, textBn: '' }, { key: 'C', textEn: c, textBn: '' }, { key: 'D', textEn: d, textBn: '' }],
      correct: correct.toUpperCase(), explanation: exp, section: section.trim().toUpperCase() === 'B' ? 'B' : 'A', image: image.trim(),
    } : x)));
  };

  const deleteQuestion = (qid) => {
    if (!confirm('Delete this question?')) return;
    onChangeQuestions((qs) => qs.filter((q) => q.id !== qid));
  };

  const sectionACount = test.questions.filter((q) => (q.section || 'A') !== 'B').length;
  const sectionBCount = test.questions.filter((q) => q.section === 'B').length;

  return (
    <>
      <div className="card2 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold muted uppercase mb-2">Add Question — NEET Pattern</p>
        <p className="text-[11px] muted mb-3">Section A questions are mandatory. Section B has 15 questions per subject, of which students answer any 10 — only the first 10 answered are scored, matching the official NEET rule. Currently: <b className="gold-text">{sectionACount} in Section A</b>, <b className="gold-text">{sectionBCount} in Section B</b>.</p>

        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px] font-bold muted uppercase block mb-1">Section</label>
            <select value={form.section} onChange={(e) => set({ section: e.target.value })} className="w-full rounded-lg px-3 py-2 text-xs">
              <option value="A">Section A (Mandatory — 35 per subject)</option>
              <option value="B">Section B (Any 10 of 15 — extra questions)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold muted uppercase block mb-1">Question Type</label>
            <select value={form.questionType} onChange={(e) => set({ questionType: e.target.value })} className="w-full rounded-lg px-3 py-2 text-xs">
              <option value="mcq">Standard MCQ</option>
              <option value="assertion-reason">Assertion-Reasoning</option>
              <option value="statement">Statement-Based</option>
            </select>
          </div>
        </div>

        {form.questionType === 'mcq' && (
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            <textarea value={form.en} onChange={(e) => set({ en: e.target.value })} rows={2} placeholder="Question (English)" className="rounded-lg px-3 py-2 text-xs" />
            <textarea value={form.bn} onChange={(e) => set({ bn: e.target.value })} rows={2} placeholder="প্রশ্ন (বাংলা) — optional" className="rounded-lg px-3 py-2 text-xs bn" />
          </div>
        )}

        {form.questionType === 'assertion-reason' && (
          <div className="space-y-2 mb-2">
            <textarea value={form.assertion} onChange={(e) => set({ assertion: e.target.value })} rows={2} placeholder="Assertion (A) — statement text" className="w-full rounded-lg px-3 py-2 text-xs" />
            <textarea value={form.reason} onChange={(e) => set({ reason: e.target.value })} rows={2} placeholder="Reason (R) — statement text" className="w-full rounded-lg px-3 py-2 text-xs" />
            <button onClick={useAssertionReasonTemplate} className="btn-ghost rounded-lg px-3 py-1.5 text-[11px] font-bold">Fill standard Assertion-Reason options (A/B/C/D)</button>
          </div>
        )}

        {form.questionType === 'statement' && (
          <div className="space-y-2 mb-2">
            <textarea value={form.en} onChange={(e) => set({ en: e.target.value })} rows={1} placeholder='Lead-in text, e.g. "Consider the following statements:"' className="w-full rounded-lg px-3 py-2 text-xs" />
            {form.statements.map((s, i) => (
              <div key={i} className="flex gap-2">
                <textarea value={s} onChange={(e) => updateStatementField(i, e.target.value)} rows={1} placeholder={`Statement ${romanize(i + 1)}`} className="flex-1 rounded-lg px-3 py-2 text-xs" />
                {form.statements.length > 1 && <button onClick={() => removeStatementField(i)} className="text-red-400 shrink-0"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addStatementField} className="btn-ghost rounded-lg px-3 py-1.5 text-[11px] font-bold">+ Add Another Statement</button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input value={form.a} onChange={(e) => set({ a: e.target.value })} type="text" placeholder="Option A" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.b} onChange={(e) => set({ b: e.target.value })} type="text" placeholder="Option B" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.c} onChange={(e) => set({ c: e.target.value })} type="text" placeholder="Option C" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.d} onChange={(e) => set({ d: e.target.value })} type="text" placeholder="Option D" className="rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          <select value={form.correct} onChange={(e) => set({ correct: e.target.value })} className="rounded-lg px-3 py-2 text-xs">
            <option>A</option><option>B</option><option>C</option><option>D</option>
          </select>
          <input value={form.exp} onChange={(e) => set({ exp: e.target.value })} type="text" placeholder="Explanation" className="rounded-lg px-3 py-2 text-xs" />
          <input value={form.solimg} onChange={(e) => set({ solimg: e.target.value })} type="text" placeholder="Solution photo URL/Base64 (optional)" className="rounded-lg px-3 py-2 text-xs" />
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <label className="btn-ghost rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <ImageUp className="w-3.5 h-3.5" /><span>{imgBusy ? 'Uploading…' : (form.image ? 'Change Diagram/Image' : 'Attach Diagram/Image (optional)')}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDiagramUpload(e.target.files[0])} />
          </label>
          {form.image && (
            <>
              <img src={form.image} alt="Question diagram preview" className="h-10 rounded-md" />
              <button onClick={() => set({ image: '' })} className="text-red-400 text-[11px] font-bold">Remove</button>
            </>
          )}
        </div>

        <button onClick={addQuestion} className="btn-gold rounded-lg px-4 py-2 text-xs font-bold">+ Add Question</button>
      </div>

      <div className="card2 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold muted uppercase mb-2">Bulk Uploader — paste 50-100 Qs as JSON array</p>
        <p className="text-[11px] muted mb-2">Each object can optionally include <code>"section":"A"</code>/<code>"B"</code>, <code>"questionType"</code> and <code>"image"</code> — anything omitted defaults to Section A / standard MCQ / no image.</p>
        <textarea value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} rows={4} placeholder='[{"textEn":"...","options":[{"key":"A","textEn":"..."},...],"correct":"A","explanation":"...","section":"A"}]' className="w-full rounded-lg px-3 py-2 text-xs font-mono" />
        <button onClick={bulkUpload} className="btn-gold rounded-lg px-4 py-2 text-xs font-bold mt-2">Upload Bulk</button>
      </div>

      <p className="text-xs font-bold muted uppercase mb-2">Questions in "{test.title}" ({test.questions.length})</p>
      <div className="space-y-2">
        {test.questions.map((q, i) => (
          <div key={q.id} className="card rounded-lg p-3 flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`badge ${(q.section || 'A') === 'B' ? 'bg-purple-500/15 text-purple-400' : 'bg-emerald-500/15 text-emerald-400'}`}>Section {q.section || 'A'}</span>
                {q.questionType && q.questionType !== 'mcq' && <span className="badge bg-sky-500/15 text-sky-400">{q.questionType === 'assertion-reason' ? 'Assertion-Reason' : 'Statement-Based'}</span>}
                {q.image && <span className="badge bg-amber-500/15 gold-text">Has Diagram</span>}
              </div>
              <p className="text-xs font-medium whitespace-pre-line">{i + 1}. {q.textEn} {q.textBn && <span className="bn muted block text-[11px]">{q.textBn}</span>}</p>
              <p className="text-[10px] muted mt-1">Correct: {q.correct}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => editQuestion(q.id)} className="text-amber-400"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteQuestion(q.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
