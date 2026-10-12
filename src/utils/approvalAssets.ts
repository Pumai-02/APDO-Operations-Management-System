/**
 * APDO Operations Management System
 * Approval Assets & Image Validation Helpers
 * Provides sample authorized signatures, official stamp assets,
 * file validation, and conversion helpers.
 */

// Helper to convert SVG string to clean transparent PNG/SVG Data URL
const svgToDataUrl = (svgString: string): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
};

// 1. Authorized Western University Red Seal Stamp (SVG Data URL)
export const SAMPLE_OFFICIAL_STAMP_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <circle cx="120" cy="120" r="112" fill="none" stroke="#b91c1c" stroke-width="3.5" />
  <circle cx="120" cy="120" r="106" fill="none" stroke="#b91c1c" stroke-width="1.2" stroke-dasharray="3 2" />
  <circle cx="120" cy="120" r="82" fill="none" stroke="#b91c1c" stroke-width="2.2" />
  <circle cx="120" cy="120" r="77" fill="none" stroke="#b91c1c" stroke-width="0.8" />
  <defs>
    <path id="stamp-arc-top" d="M 35 120 A 85 85 0 1 1 205 120" />
    <path id="stamp-arc-bot" d="M 205 120 A 85 85 0 0 1 35 120" />
  </defs>
  <text fill="#b91c1c" font-size="14.5" font-weight="bold" letter-spacing="0.8" font-family="'Khmer OS', 'Khmer OS Battambang', 'Segoe UI', sans-serif">
    <textPath href="#stamp-arc-top" startOffset="50%" text-anchor="middle">
      សាកលវិទ្យាល័យ វេស្ទើន
    </textPath>
  </text>
  <text fill="#b91c1c" font-size="11.5" font-weight="900" letter-spacing="1.8" font-family="Arial, sans-serif">
    <textPath href="#stamp-arc-bot" startOffset="50%" text-anchor="middle">
      ★ WESTERN UNIVERSITY ★
    </textPath>
  </text>
  <g transform="translate(80, 80) scale(0.4)">
    <polygon points="100,10 180,48 180,140 100,192 20,140 20,48" fill="#fef2f2" stroke="#b91c1c" stroke-width="6" />
    <text x="100" y="80" text-anchor="middle" fill="#b91c1c" font-size="24" font-weight="900" font-family="Arial, sans-serif">WESTERN</text>
    <text x="100" y="112" text-anchor="middle" fill="#b91c1c" font-size="15" font-weight="bold" font-family="Arial, sans-serif">PHNOM PENH</text>
    <path d="M 50 138 L 100 120 L 150 138" stroke="#b91c1c" stroke-width="5" fill="none" />
  </g>
</svg>
`);

// 2. Authorized Administrator Signature (Mr. Im Saravuth / Dr. Sarah Sterling - Dark Blue Ink)
export const SAMPLE_ADMIN_SIGNATURE_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100">
  <path
    d="M 15 55 Q 35 15 55 58 T 85 35 Q 105 78 125 40 L 140 75 L 175 22"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="3.2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 135 62 L 155 75 L 185 25"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 40 82 Q 95 78 160 76"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
`);

// 3. Authorized Dean Signatures per Department
// 3a. Dean of Computer Science & IT (Prof. Robert Vance)
export const SAMPLE_DEAN_VANCE_SIGNATURE_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" width="220" height="100">
  <path
    d="M 25 55 C 42 18, 58 78, 75 40 C 92 12, 108 72, 125 45 C 142 25, 160 75, 190 45"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 45 68 Q 115 65 198 58"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="2.6"
    stroke-linecap="round"
  />
</svg>
`);
export const SAMPLE_DEAN_SIGNATURE_URL = SAMPLE_DEAN_VANCE_SIGNATURE_URL;

// 3b. Dean of Business Administration & Accounting (Dr. Marcus Bradley - Elegant Emerald/Navy Sharp Script)
export const SAMPLE_DEAN_BRADLEY_SIGNATURE_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" width="220" height="100">
  <path
    d="M 20 60 Q 40 20 60 62 T 95 38 Q 115 70 135 48 L 150 78 L 195 28"
    fill="none"
    stroke="#0f3460"
    stroke-width="3.2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 30 75 Q 110 72 185 68"
    fill="none"
    stroke="#0f3460"
    stroke-width="2.2"
    stroke-linecap="round"
  />
  <circle cx="196" cy="30" r="3" fill="#0f3460" />
</svg>
`);

// 3c. Dean of Engineering & Architecture (Dr. Elena Rostova - Precision Technical Script)
export const SAMPLE_DEAN_ROSTOVA_SIGNATURE_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" width="220" height="100">
  <path
    d="M 25 65 C 40 30 55 80 70 45 L 85 70 L 105 35 Q 125 75 145 42 L 175 60 L 190 25"
    fill="none"
    stroke="#1e293b"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 50 82 L 180 78"
    fill="none"
    stroke="#1e293b"
    stroke-width="2.4"
    stroke-linecap="round"
  />
</svg>
`);

// 3d. Dean of Foreign Languages & Humanities (Dr. Sophal Meas - Flowing Calligraphic Script)
export const SAMPLE_DEAN_MEAS_SIGNATURE_URL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" width="220" height="100">
  <path
    d="M 20 50 Q 45 15 65 55 T 100 30 Q 130 80 150 40 Q 170 15 195 48"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M 35 72 Q 100 66 185 64"
    fill="none"
    stroke="#1e3a8a"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
`);

/**
 * Return Dean-specific sample signature based on user ID
 */
export const getDeanSampleSignature = (deanUserId?: string | null): string => {
  switch (deanUserId) {
    case '5':
      return SAMPLE_DEAN_BRADLEY_SIGNATURE_URL;
    case '6':
      return SAMPLE_DEAN_ROSTOVA_SIGNATURE_URL;
    case '7':
      return SAMPLE_DEAN_MEAS_SIGNATURE_URL;
    case '2':
    default:
      return SAMPLE_DEAN_VANCE_SIGNATURE_URL;
  }
};

// Validation Constants
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml'
];

/**
 * Validates an uploaded image file for format and size
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a PNG, JPEG, SVG, or WebP image.'
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum permitted file size is 5 MB.`
    };
  }

  return { valid: true };
};

/**
 * Reads a File object and converts it to a base64 Data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};
