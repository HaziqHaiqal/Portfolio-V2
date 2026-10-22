import { TERAS_BINA as P } from '@components/Templates/photos';

export const BRAND = 'Teras Bina';
export { P as PHOTOS };
export const LEGAL_NAME = 'Teras Bina Sdn Bhd';
export const BASE_PATH = '/templates/teras-bina';

export const NAV = [
  { href: `${BASE_PATH}/services`, label: 'Services' },
  { href: `${BASE_PATH}/projects`, label: 'Projects' },
  { href: `${BASE_PATH}/about`, label: 'About' },
  { href: `${BASE_PATH}/contact`, label: 'Contact' },
];

export const CREDENTIALS = [
  { name: 'CIDB Grade G7', note: 'No limit on contract value' },
  { name: 'ISO 9001:2015', note: 'Quality management' },
  { name: 'ISO 45001:2018', note: 'Safety and health' },
  { name: 'MOF registered', note: 'Government tenders' },
];

export const STATS = [
  { value: '28', label: 'Years building' },
  { value: '310', label: 'Projects handed over' },
  { value: 'RM1.4b', label: 'Contracts delivered' },
  { value: '0', label: 'Lost-time injuries in 2025' },
];

export const SERVICES = [
  {
    id: 'building',
    title: 'Building construction',
    text: 'Hospitals, schools, offices and high-rise homes, from piling to handover.',
    image: P.svcBuilding,
    scope: [
      'Main contractor up to RM250 million',
      'Reinforced concrete and steel frames',
      'Fit-out and handover with defects support',
    ],
  },
  {
    id: 'civil',
    title: 'Civil and infrastructure',
    text: 'Earthworks, roads and drainage for new townships and industrial parks.',
    image: P.svcCivil,
    scope: [
      'Earthworks and slope protection',
      'Roads, culverts and drainage',
      'Water and sewerage reticulation',
    ],
  },
  {
    id: 'mne',
    title: 'M&E installation',
    text: 'Electrical, air-conditioning, fire protection and plumbing by our own crews.',
    image: P.svcMne,
    scope: [
      'HV and LV electrical systems',
      'Chilled water and VRF air-conditioning',
      'Fire protection and plumbing',
    ],
  },
  {
    id: 'design-build',
    title: 'Design and build',
    text: 'One contract from concept to keys, with architects and engineers in-house.',
    image: P.svcDesign,
    scope: [
      'Feasibility, design and authority approvals',
      'Fixed price and programme from day one',
      'One team accountable for the result',
    ],
  },
];

export const SECTORS = [
  'Healthcare',
  'Education',
  'Commercial',
  'Industrial',
  'Residential',
] as const;
export type Sector = (typeof SECTORS)[number];

export interface Project {
  id: string;
  name: string;
  location: string;
  sector: Sector;
  client: string;
  value: string;
  duration: string;
  year: string;
  status: 'Completed' | 'In progress';
  summary: string;
  image: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'medical-centre',
    name: 'Specialist medical centre',
    location: 'Seremban, Negeri Sembilan',
    sector: 'Healthcare',
    client: 'Private healthcare group',
    value: 'RM86 million',
    duration: '26 months',
    year: '2024',
    status: 'Completed',
    summary:
      'A 7-storey, 180-bed hospital with operating theatres, an imaging suite and a helipad, delivered while the existing clinic stayed open.',
    image: P.pMedical,
  },
  {
    id: 'pharma-lab',
    name: 'Pharmaceutical laboratory',
    location: 'Bandar Enstek, Negeri Sembilan',
    sector: 'Industrial',
    client: 'Pharmaceutical manufacturer',
    value: 'RM64 million',
    duration: '22 months',
    year: '2024',
    status: 'Completed',
    summary:
      'A GMP-grade laboratory and cleanroom block with full M&E by our own crews, handed over two weeks early.',
    image: P.pLab,
  },
  {
    id: 'logistics-hub',
    name: 'Regional logistics hub',
    location: 'Port Klang, Selangor',
    sector: 'Industrial',
    client: 'Regional logistics operator',
    value: 'RM95 million',
    duration: '24 months',
    year: '2026',
    status: 'In progress',
    summary:
      'A 40,000 m² warehouse with 32 loading bays and a 5-storey office tower, now at roof works.',
    image: P.pOngoing,
  },
  {
    id: 'teaching-block',
    name: 'University teaching block',
    location: 'Nilai, Negeri Sembilan',
    sector: 'Education',
    client: 'Private university',
    value: 'RM42 million',
    duration: '20 months',
    year: '2023',
    status: 'Completed',
    summary:
      'Lecture theatres, labs and a library for 3,000 students, built around a shaded central courtyard.',
    image: P.pCampus,
  },
  {
    id: 'corporate-hq',
    name: 'Corporate headquarters',
    location: 'Cyberjaya, Selangor',
    sector: 'Commercial',
    client: 'Listed technology company',
    value: 'RM120 million',
    duration: '30 months',
    year: '2022',
    status: 'Completed',
    summary:
      'A 12-storey office with GreenRE Gold certification, solar canopies and a 900-bay car park.',
    image: P.pOffice,
  },
  {
    id: 'serviced-apartments',
    name: 'Serviced apartments',
    location: 'Mont Kiara, Kuala Lumpur',
    sector: 'Residential',
    client: 'Property developer',
    value: 'RM210 million',
    duration: '36 months',
    year: '2021',
    status: 'Completed',
    summary:
      'Twin 38-storey towers with 620 units, a sky pool and podium retail, completed during the 2020 to 2021 lockdowns.',
    image: P.pResidence,
  },
];

export const CLIENTS = [
  'Medivest Health',
  'Kiara Land',
  'Enstek Pharma',
  'Nilai Education',
  'PKL Logistics',
  'Cyber Holdings',
  'Selangor Water',
  'Perdana Group',
];

export const PROCESS = [
  {
    title: 'Tender and estimate',
    text: 'Budget, programme and method statement within 3 working days.',
  },
  {
    title: 'Design and approvals',
    text: 'Our engineers coordinate drawings and authority submissions.',
  },
  {
    title: 'Build',
    text: 'Weekly progress reports with photos, costs and safety records.',
  },
  {
    title: 'Handover',
    text: 'Snag-free handover, as-built drawings and a 24-month defects period.',
  },
];

export const TIMELINE = [
  {
    year: '1998',
    text: 'Founded in Shah Alam as a Grade G4 building contractor.',
  },
  {
    year: '2006',
    text: 'Upgraded to CIDB Grade G7, with no limit on contract value.',
  },
  {
    year: '2012',
    text: 'Certified to ISO 9001 and set up the in-house M&E division.',
  },
  { year: '2018', text: 'Delivered the first project above RM100 million.' },
  {
    year: '2024',
    text: 'Passed 2 million man-hours without a lost-time injury.',
  },
];

export const LEADERS = [
  {
    name: 'Ir. Azman Hashim',
    role: 'Managing Director',
    note: 'Civil engineer, 30 years in construction',
  },
  {
    name: 'Tan Wei Ling',
    role: 'Projects Director',
    note: 'Led 40 projects from tender to handover',
  },
  {
    name: 'Suresh Kumar',
    role: 'Head of Safety and Health',
    note: 'DOSH-registered safety officer',
  },
];

export const OFFICES = [
  {
    city: 'Shah Alam',
    label: 'Head office',
    address:
      'Lot 12, Jalan Utarid U5/14, Seksyen U5, 40150 Shah Alam, Selangor',
    phone: '03-7845 2100',
  },
  {
    city: 'Johor Bahru',
    label: 'Southern office',
    address:
      'No. 8, Jalan Persiaran Molek, Taman Molek, 81100 Johor Bahru, Johor',
    phone: '07-351 8820',
  },
];

export const TESTIMONIAL = {
  quote:
    'Teras Bina handed over our medical centre two weeks early, with the clinic next door running the whole time. Their weekly reports meant we were never surprised.',
  name: 'Dr. Farah Ismail',
  role: 'Chief Operating Officer, private healthcare group',
};
