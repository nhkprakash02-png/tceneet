// Single source of truth for the faculty/tutor list shown across the site — the homepage
// "Meet the Team" section (components/Mentors.jsx), the site-wide Footer's "Faculty Contact"
// list (components/Footer.jsx), and the "Notices & Contact" page (views/Notices.jsx).
//
// Photos are static files in /public (NOT uploaded through the Admin Panel) — see PHOTO
// FILENAME below each entry. If a photo file is missing at that path, the homepage card
// automatically falls back to a gold initial-letter avatar, so nothing breaks either way.
//
// To add/remove/edit a faculty member, this is the ONLY file you need to change — it will
// automatically update on the homepage, the Footer, and the Contact page at the same time.
export const FACULTY = [
  {
    id: 'rahul-debnath',
    name: 'Rahul Debnath',
    role: 'Biology Instructor',
    // Digits only, with country code, no "+" or spaces — used to build the wa.me link.
    phone: '917477603087',
    // Shown to visitors as plain text, right under the name.
    displayPhone: '+91 7477603087',
    // PHOTO FILENAME: public/faculty-rahul-debnath.jpg
    photo: '/faculty-rahul-debnath.jpg',
  },
  {
    id: 'saikat-mondal',
    name: 'Saikat Mondal',
    role: 'Chemistry Instructor',
    phone: '917047828835',
    displayPhone: '+91 70478 28835',
    // PHOTO FILENAME: public/faculty-saikat-mondal.jpg
    photo: '/faculty-saikat-mondal.jpg',
  },
];
