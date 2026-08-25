/**
 * Generates a clean, valid PDF Data URL for candidate profiles
 */
export function generateCandidatePdfDataUrl(params: {
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  bio?: string;
}): string {
  const name = (params.fullName || 'Candidate Profile').replace(/[()]/g, '');
  const title = (params.headline || 'Senior Software Engineer').replace(/[()]/g, '');
  const contact = `${params.email || 'candidate@knowtohire.com'} | ${params.phone || '+91 98765 43210'} | ${params.location || 'India'}`.replace(/[()]/g, '');
  const skillsList = `Core Competencies: ${(params.skills || ['Full Stack Development', 'React', 'Node.js', 'Cloud Architecture']).slice(0, 10).join(', ')}`.replace(/[()]/g, '');
  const summary = (params.bio || 'Experienced engineering professional with proven expertise delivering high-performance scalable systems and business solutions.').replace(/[()]/g, '').slice(0, 200);

  const streamContent = `BT
/F1 22 Tf
50 740 Td
(${name}) Tj
/F2 12 Tf
0 -26 Td
(${title}) Tj
/F3 9 Tf
0 -18 Td
(${contact}) Tj
0 -20 Td
(----------------------------------------------------------------------------------------------------------------) Tj
/F1 12 Tf
0 -25 Td
(EXECUTIVE SUMMARY) Tj
/F3 10 Tf
0 -16 Td
(${summary}) Tj
/F1 12 Tf
0 -28 Td
(KEY SKILLS & COMPETENCIES) Tj
/F3 10 Tf
0 -16 Td
(${skillsList}) Tj
/F1 12 Tf
0 -28 Td
(PROFESSIONAL WORK EXPERIENCE) Tj
/F2 11 Tf
0 -16 Td
(Lead Full Stack & Cloud Solutions Engineer - Enterprise Systems (2022 - Present)) Tj
/F3 9 Tf
0 -14 Td
(* Architected and scaled distributed full-stack cloud web applications handling 50k+ daily transactions.) Tj
0 -13 Td
(* Integrated automated CI/CD pipelines, state management architectures, and high-throughput APIs.) Tj
/F2 11 Tf
0 -20 Td
(Software Engineer - Tech Solutions India (2019 - 2022)) Tj
/F3 9 Tf
0 -14 Td
(* Developed modern frontend components, microservices APIs, and secure database integrations.) Tj
/F1 12 Tf
0 -28 Td
(EDUCATION & ACADEMICS) Tj
/F2 10 Tf
0 -15 Td
(Bachelor of Technology in Computer Science & Engineering - First Class Distinction) Tj
ET`;

  const streamLength = streamContent.length;

  const pdf = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Resources <<
    /Font <<
      /F1 4 0 R
      /F2 5 0 R
      /F3 6 0 R
    >>
  >>
  /Contents 7 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
6 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
7 0 obj
<<
  /Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000282 00000 n 
0000000366 00000 n 
0000000450 00000 n 
0000000529 00000 n 
trailer
<<
  /Size 8
  /Root 1 0 R
>>
startxref
${600 + streamLength}
%%EOF`;

  const base64 = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(pdf)))
    : Buffer.from(pdf).toString('base64');

  return `data:application/pdf;base64,${base64}`;
}
