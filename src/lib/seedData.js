// NEET edition of the seed data. Ported structure from the original TCE seedDB(), retargeted
// from government-job subjects (Math/English/Reasoning/GK) to the four official NEET subjects:
// Physics, Chemistry, Botany and Zoology. Every demo mock test now follows the real NEET
// pattern — 35 mandatory Section A questions + 15 Section B questions (any 10 answered count) —
// via the `section: 'A' | 'B'` tag on each question, and the official NEET marking scheme of
// +4 for a correct answer / -1 for an incorrect one (see lib/examEngine.js buildSubmission).
import { uid } from './utils';
import { SUBCATEGORIES, NEET_SUBJECTS } from './utils';

const NEET_MARKS_CORRECT = 4;
const NEET_MARKS_WRONG = 1;

export function seedDB() {
  const subjects = [...NEET_SUBJECTS, 'full'];
  const subjectLabel = { physics: 'Physics', chemistry: 'Chemistry', botany: 'Botany', zoology: 'Zoology', full: 'Full Mock' };

  function sampleQ(subject, n) {
    const banks = {
      physics: [
        { en: 'The SI unit of electric charge is:', bn: '', opts: ['Ampere', 'Coulomb', 'Volt', 'Ohm'], correct: 1, exp: 'Electric charge is measured in Coulombs (C).' },
        { en: 'The dimensional formula of force is:', bn: '', opts: ['[MLT⁻¹]', '[MLT⁻²]', '[ML²T⁻²]', '[ML⁻¹T⁻²]'], correct: 1, exp: 'Force = mass × acceleration, so [M][LT⁻²] = [MLT⁻²].' },
        { en: 'Which law states that the rate of change of momentum is proportional to the applied force?', bn: '', opts: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Conservation of Momentum"], correct: 1, exp: "Newton's Second Law defines force as the rate of change of momentum." },
        { en: "The value of Planck's constant is approximately:", bn: '', opts: ['6.63 × 10⁻34 J·s', '3 × 10⁸ J·s', '9.1 × 10⁻31 J·s', '1.6 × 10⁻19 J·s'], correct: 0, exp: "Planck's constant h ≈ 6.63 × 10⁻34 J·s." },
        { en: 'A concave mirror always forms a virtual image when the object is placed:', bn: '', opts: ['Beyond the centre of curvature', 'At the focus', 'Between the pole and focus', 'At the centre of curvature'], correct: 2, exp: 'An object between the pole and focus of a concave mirror produces a virtual, magnified image.' },
      ],
      chemistry: [
        { en: 'The number of electrons in the outermost shell of a Noble gas (except He) is:', bn: '', opts: ['2', '4', '6', '8'], correct: 3, exp: 'Noble gases (except Helium) have a stable octet — 8 electrons in the outermost shell.' },
        { en: 'Which of the following is an example of a Lewis acid?', bn: '', opts: ['NH₃', 'BF₃', 'H₂O', 'OH⁻'], correct: 1, exp: 'BF₃ is electron-deficient and accepts an electron pair, making it a Lewis acid.' },
        { en: 'The IUPAC name of CH₃-CH₂-OH is:', bn: '', opts: ['Methanol', 'Ethanol', 'Ethanal', 'Ethanoic acid'], correct: 1, exp: 'CH₃-CH₂-OH is ethanol (a 2-carbon alcohol).' },
        { en: 'Which quantum number determines the shape of an orbital?', bn: '', opts: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (m)', 'Spin (s)'], correct: 1, exp: 'The azimuthal quantum number (l) determines the sub-shell/orbital shape.' },
        { en: 'The pH of a neutral solution at 25°C is:', bn: '', opts: ['0', '7', '14', '1'], correct: 1, exp: 'A neutral solution has pH = 7 at 25°C.' },
      ],
      botany: [
        { en: 'The site of photosynthesis in a plant cell is the:', bn: '', opts: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'], correct: 1, exp: 'Chloroplasts contain chlorophyll and carry out photosynthesis.' },
        { en: 'Which plant tissue is responsible for the upward conduction of water?', bn: '', opts: ['Phloem', 'Xylem', 'Cambium', 'Epidermis'], correct: 1, exp: 'Xylem conducts water and minerals upward from roots to leaves.' },
        { en: 'Double fertilization is a characteristic feature of:', bn: '', opts: ['Gymnosperms', 'Angiosperms', 'Bryophytes', 'Pteridophytes'], correct: 1, exp: 'Double fertilization (forming zygote + endosperm) is unique to angiosperms.' },
        { en: 'The functional unit of classification in taxonomy is:', bn: '', opts: ['Genus', 'Family', 'Species', 'Order'], correct: 2, exp: 'Species is the basic/functional unit of biological classification.' },
        { en: 'Which hormone is responsible for apical dominance in plants?', bn: '', opts: ['Cytokinin', 'Auxin', 'Gibberellin', 'Ethylene'], correct: 1, exp: 'Auxin suppresses lateral bud growth, maintaining apical dominance.' },
      ],
      zoology: [
        { en: 'The functional unit of the kidney is the:', bn: '', opts: ['Neuron', 'Nephron', 'Alveolus', 'Sarcomere'], correct: 1, exp: 'The nephron is the structural and functional unit of the kidney.' },
        { en: 'Which blood cells are primarily responsible for fighting infection?', bn: '', opts: ['RBCs', 'WBCs', 'Platelets', 'Plasma'], correct: 1, exp: 'White Blood Cells (WBCs/leukocytes) form the primary immune defense.' },
        { en: 'Insulin is secreted by which cells of the pancreas?', bn: '', opts: ['Alpha cells', 'Beta cells', 'Delta cells', 'Acinar cells'], correct: 1, exp: 'Beta cells of the islets of Langerhans secrete insulin.' },
        { en: 'The process of cell division that produces gametes is called:', bn: '', opts: ['Mitosis', 'Meiosis', 'Binary fission', 'Budding'], correct: 1, exp: 'Meiosis reduces the chromosome number by half to produce gametes.' },
        { en: 'Which of the following is a vestigial organ in humans?', bn: '', opts: ['Appendix', 'Liver', 'Pancreas', 'Spleen'], correct: 0, exp: 'The vermiform appendix is considered a vestigial organ in humans.' },
      ],
    };
    const src = subject === 'full' ? [].concat(banks.physics.slice(0, 2), banks.chemistry.slice(0, 2), banks.botany.slice(0, 1), banks.zoology.slice(0, 1)) : banks[subject];
    const out = [];
    for (let i = 0; i < n; i++) {
      const q = src[i % src.length];
      out.push({
        id: uid('q'), textEn: q.en, textBn: q.bn || '',
        options: q.opts.map((o, idx) => ({ key: String.fromCharCode(65 + idx), textEn: o, textBn: '' })),
        correct: String.fromCharCode(65 + q.correct), explanation: q.exp, solutionImg: '', image: '',
        // First 35 questions of a full-length NEET paper are Section A (mandatory); anything
        // from index 35 onward is Section B (any 10 of 15 answered are scored) — matches the
        // official NEET pattern per subject. Demo tests here are short, so this mostly just
        // demonstrates the tagging; real tests should have 50 questions per subject (35 + 15).
        section: i < 35 ? 'A' : 'B', questionType: 'mcq',
      });
    }
    return out;
  }

  const mockTests = {};
  subjects.forEach((sub) => {
    mockTests[sub] = [1, 2, 3].map((n) => ({
      id: uid('mt'), subject: sub, title: `${subjectLabel[sub]} Mock Test ${n}`, isDemo: n === 1, adminUnlocked: false, examCategory: 'NEET UG',
      durationMin: sub === 'full' ? 180 : 45, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG,
      subCategory: SUBCATEGORIES[sub] ? SUBCATEGORIES[sub][(n - 1) % SUBCATEGORIES[sub].length] : undefined,
      questions: sampleQ(sub, sub === 'full' ? 12 : 10),
    }));
  });

  // Quick Quiz pool is now mixed across all 4 NEET subjects (there is no "GK" subject in
  // NEET) — Quiz.jsx draws randomly from whichever subjects the admin has uploaded questions
  // for, via lib/utils.js NEET_SUBJECTS.
  const quizPool = NEET_SUBJECTS.flatMap((sub) => sampleQ(sub, 6).map((q) => ({ ...q, subject: sub, section: 'A' })));

  const pyqSets = [
    { id: uid('pyq'), title: 'NEET UG 2024 - Physics Section', examCategory: 'NEET UG', year: '2024', durationMin: 45, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG, questions: sampleQ('physics', 8) },
    { id: uid('pyq'), title: 'NEET UG 2024 - Chemistry Section', examCategory: 'NEET UG', year: '2024', durationMin: 45, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG, questions: sampleQ('chemistry', 8) },
    { id: uid('pyq'), title: 'NEET UG 2023 - Botany Section', examCategory: 'NEET UG', year: '2023', durationMin: 45, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG, questions: sampleQ('botany', 8) },
    { id: uid('pyq'), title: 'NEET UG 2023 - Zoology Section', examCategory: 'NEET UG', year: '2023', durationMin: 45, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG, questions: sampleQ('zoology', 8) },
    { id: uid('pyq'), title: 'NEET UG 2022 - Full Paper (Sample)', examCategory: 'NEET UG', year: '2022', durationMin: 180, marksCorrect: NEET_MARKS_CORRECT, marksWrong: NEET_MARKS_WRONG, questions: sampleQ('full', 12) },
  ];

  return {
    examCategories: ['NEET UG'],
    banners: [
      { title: 'NEET UG 2027 Batch — Admissions Open', subtitle: 'Complete Physics, Chemistry, Botany & Zoology coverage with daily mock tests', tag: 'Admissions Open', grad: 'from-amber-600 via-yellow-500 to-orange-600' },
      { title: 'NEET Crash Course', subtitle: 'Intensive revision batch with expert faculty & full-length test series', tag: 'Limited Seats', grad: 'from-yellow-600 via-amber-500 to-yellow-400' },
      { title: 'Free NEET Mock Tests', subtitle: 'Practice with the official NEET pattern — Section A & B, +4/-1 marking', tag: 'Try Now', grad: 'from-orange-600 via-amber-500 to-yellow-500' },
    ],
    ticker: '🚨 Now Coaching for NEET UG (Physics, Chemistry, Botany & Zoology) — All-in-one CBT Mock Test Platform!  🎉 New batches starting soon — Enroll now!  📢 100% Free PYQs, Daily Quizzes & Study Materials for everyone.  📝 Weekly full-length mock test every Sunday.',
    students: [
      { id: uid('st'), name: 'Demo Student One', phone: '9800011122', email: 'demo1@example.com', address: '', joinDate: '2026-06-12', paymentStatus: 'Approved', batch: 'NEET Crash Course' },
      { id: uid('st'), name: 'Demo Student Two', phone: '9800033344', email: 'demo2@example.com', address: '', joinDate: '2026-07-02', paymentStatus: 'Pending', batch: 'NEET UG 2027 Batch' },
    ],
    mockTests, quizPool, pyqSets,
    quizDurations: { 5: 3, 10: 7, 15: 10, 20: 12 },
    submissions: [],
    materials: {
      physics: [{ id: uid('mat'), title: 'Physics Formula Booklet (Demo)', url: '', isFreeDemo: true, views: 0 }],
      chemistry: [{ id: uid('mat'), title: 'Chemistry Reactions Notes (Demo)', url: '', isFreeDemo: true, views: 0 }],
      botany: [{ id: uid('mat'), title: 'Botany NCERT Line-by-Line Notes (Demo)', url: '', isFreeDemo: true, views: 0 }],
      zoology: [{ id: uid('mat'), title: 'Zoology Diagrams & Notes (Demo)', url: '', isFreeDemo: true, views: 0 }],
    },
    notices: [
      { id: uid('nt'), title: 'NEET UG 2027 Admissions Open', date: '2026-08-20', body: 'Enrollment for the new NEET batch is now open. Contact us to reserve your seat.' },
      { id: uid('nt'), title: 'Sunday Full Mock Test Schedule', date: '2026-08-24', body: 'Full length NEET pattern mock test every Sunday. Enrolled students will get notification via WhatsApp.' },
    ],
    inquiries: [],
    batches: [
      { id: uid('bt'), name: 'NEET UG 2027 Batch', price: 500, active: true, examCategory: 'NEET UG',
        features: ['All premium NEET mock tests unlocked (Section A + B, +4/-1 marking)', 'Full study material library', 'Live doubt-clearing WhatsApp group', 'Rank & performance analytics'],
        timetable: [['Mon / Wed / Fri', 'Physics & Chemistry'], ['Tue / Thu', 'Botany & Zoology'], ['Sunday', 'Full Mock Test']] },
      { id: uid('bt'), name: 'NEET Crash Course', price: 800, active: true, examCategory: 'NEET UG',
        features: ['Rapid revision of all 4 subjects', 'Daily full-length mock tests', 'Expert mentor support'],
        timetable: [['Mon-Sat', 'Rotating Subject Revision'], ['Sunday', 'Full Mock Test']] },
    ],
    // No mentor photos or names are shipped with this NEET template — add your own faculty via
    // the Admin Panel's Mentors tab (photo uploads become compressed Base64, same as student
    // profile photos, so no Firebase Storage bucket is required). Leaving this empty means the
    // homepage "Meet the Team" section simply doesn't render until you add someone.
    mentors: [],
    urgentNotices: [],
  };
}

export function normalizeDB(db) {
  Object.keys(db.mockTests || {}).forEach((sub) => {
    (db.mockTests[sub] || []).forEach((t) => { if (!t.examCategory) t.examCategory = 'NEET UG'; if (t.adminUnlocked === undefined) t.adminUnlocked = false; });
  });
  Object.keys(db.materials || {}).forEach((cat) => {
    (db.materials[cat] || []).forEach((m) => { if (m.isFreeDemo === undefined) m.isFreeDemo = false; });
  });
  (db.students || []).forEach((s) => { if (s.pendingReview === undefined) s.pendingReview = false; });
  if (!db.urgentNotices) db.urgentNotices = []; // backfill for existing live databases
  // Backfill any of the 4 NEET subjects that might be missing from an existing live database
  // (e.g. one that was seeded before this NEET conversion) with fresh seed content, and tag
  // every question that predates the Section A/B pattern as Section A (mandatory) so nothing
  // ever silently drops out of scoring.
  const seeded = seedDB();
  Object.keys(seeded.mockTests).forEach((sub) => {
    if (!db.mockTests) db.mockTests = {};
    if (!db.mockTests[sub] || !db.mockTests[sub].length) db.mockTests[sub] = seeded.mockTests[sub];
  });
  Object.keys(seeded.materials).forEach((cat) => {
    if (!db.materials) db.materials = {};
    if (!db.materials[cat] || !db.materials[cat].length) db.materials[cat] = seeded.materials[cat];
  });
  Object.keys(db.mockTests || {}).forEach((sub) => {
    (db.mockTests[sub] || []).forEach((t) => {
      (t.questions || []).forEach((q) => { if (!q.section) q.section = 'A'; if (!q.questionType) q.questionType = 'mcq'; if (q.image === undefined) q.image = ''; });
    });
  });
  (db.pyqSets || []).forEach((t) => (t.questions || []).forEach((q) => { if (!q.section) q.section = 'A'; if (!q.questionType) q.questionType = 'mcq'; if (q.image === undefined) q.image = ''; }));
  (db.quizPool || []).forEach((q) => { if (!q.section) q.section = 'A'; if (!q.questionType) q.questionType = 'mcq'; if (q.image === undefined) q.image = ''; });
  if (!db.quizDurations) db.quizDurations = { 5: 3, 10: 7, 15: 10, 20: 12 };
  (db.batches || []).forEach((b) => {
    if (!b.examCategory) b.examCategory = 'NEET UG';
    if (b.price === undefined || b.price === null || Number.isNaN(Number(b.price))) b.price = 500;
    if (b.originalPrice !== undefined && b.originalPrice !== null && !(Number(b.originalPrice) > Number(b.price))) delete b.originalPrice;
    if (!b.features || !b.features.length) b.features = ['Full access to all Mocks', 'PYQ Hub with multi-attempt analysis', 'Daily Quizzes', 'Detailed Analysis', 'Unlimited Re-attempts'];
  });
  if (!db.examCategories || !db.examCategories.length) db.examCategories = ['NEET UG'];
  if (!db.mentors) db.mentors = [];
  return db;
}

// Structurally-valid but EMPTY database, used as the app's placeholder state before the real
// Firestore load finishes — replaces using seedDB() as that placeholder, which is what caused
// the "dummy Mock Test 1/2/3 flashes for a second on refresh" bug: the seed data used to
// render immediately on first paint since it WAS the initial state, before real data arrived
// and replaced it. An empty shape here means there's simply no dummy content to flash; pages
// should check `dbLoading` (see AppContext) to show a skeleton/spinner instead during this gap.
export function emptyDB() {
  return {
    examCategories: [], banners: [], ticker: '', students: [],
    mockTests: { physics: [], chemistry: [], botany: [], zoology: [], full: [] },
    quizPool: [], pyqSets: [], submissions: [],
    materials: { physics: [], chemistry: [], botany: [], zoology: [] },
    notices: [], inquiries: [], batches: [], mentors: [], quizDurations: {}, urgentNotices: [],
  };
}
