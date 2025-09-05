
// src/ai/flows/cover-letter-generator-flow.ts
'use server';

/**
 * @fileOverview Generates a personalized cover letter for a job application.
 *
 * - coverLetterGenerator - A function that generates the cover letter.
 * - CoverLetterGeneratorInput - The input type for the coverLetterleSGenerator function.
 * - CoverLetterGeneratorOutput - The return type for the coverLetterGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { readFileSync } from 'fs';
import path from 'path';
import { getCompanyIntelligenceTool } from './get-company-intelligence-tool';
import { JSDOM } from 'jsdom';

const CoverLetterGeneratorInputSchema = z.object({
  companyUrl: z.string().describe('The URL of the company website or job posting.'),
  jobTitle: z.string().optional().describe('The job title for the application.'),
});

export type CoverLetterGeneratorInput = z.infer<typeof CoverLetterGeneratorInputSchema>;

const CoverLetterGeneratorOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
  companyIntelligence: z.object({
    companyName: z.string(),
    companyMission: z.string(),
    keyProjects: z.string(),
  }).describe('The intelligence gathered about the company.'),
});

export type CoverLetterGeneratorOutput = z.infer<typeof CoverLetterGeneratorOutputSchema>;

const getJobDescriptionTool = ai.defineTool({
  name: 'getJobDescription',
  description: 'Scrapes a job posting URL to extract the full job description text.',
  inputSchema: z.object({ url: z.string().url() }),
  outputSchema: z.string(),
}, async ({ url }) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = `Failed to fetch job description. Status: ${response.status} ${response.statusText}`;
      console.error(errorText);
      return errorText;
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const textContent = dom.window.document.body.textContent || '';
    if (!textContent.trim()) {
      return `No text content found at the provided URL: ${url}`;
    }
    return textContent;
  } catch (error: any) {
    console.error('Error in getJobDescriptionTool:', error);
    return `Failed to retrieve job description from ${url}. The URL might be invalid, blocked, or the server unreachable. Error: ${error.message}`;
  }
});


export async function coverLetterGenerator(input: CoverLetterGeneratorInput): Promise<CoverLetterGeneratorOutput> {
  return coverLetterGeneratorFlow(input);
}

const letterWritingPrompt = ai.definePrompt({
  name: 'letterWritingPrompt',
  input: {schema: z.object({
    userProfile: z.string(),
    companyIntelligence: z.any(),
    jobDescription: z.string(),
    jobTitle: z.string().optional(),
  })},
  output: {schema: z.object({ coverLetter: z.string() })},
  prompt: `You are an expert business development strategist, writing on behalf of a high-level regenerative design consultant. Your task is to draft a compelling letter of introduction that positions the consultant as a strategic partner, not a job applicant.

  POSITIONING FRAMEWORK:
  - Position as a strategic consultant/collaborator, NOT a job candidate.
  - Focus on the specific, high-value consultancy services the user can provide, leveraging their proprietary AI tools and research.
  - Emphasize geographic flexibility (based in Newcastle, available for remote/hybrid collaboration).
  - Frame this as a business development opportunity or a proposal for partnership.

  LANGUAGE TO USE:
  - Use terms like "contribute to your initiatives," "strategic collaboration," "partnership opportunity," "enhance your current work," and "tailored solutions."
  - AVOID terms like "ideal candidate," "job opening," "my application," or "employment opportunity."

  INPUTS FOR ANALYSIS:
  1. Consultant's Profile: {{{userProfile}}}
  2. Target Company Intelligence: {{{companyIntelligence.companyName}}}, {{{companyIntelligence.companyMission}}}, {{{companyIntelligence.keyProjects}}}
  3. Opportunity Context (Job Description, if any): {{{jobDescription}}}

  YOUR TASK:
  1. Synthesize all three inputs to understand the potential synergies.
  2. Draft a formal letter of introduction. This letter must NOT read like a job application. It should be a proactive, peer-to-peer proposal for collaboration.
  3. Reference the consultant's specific expertise (from their profile) and connect it directly to the target company's specific projects or mission.
  4. Subtly introduce the consultant's proprietary AI platforms (the RDI and Democracy tools mentioned in their research) as a unique capability that can enhance the company's current work.
  5. If the job description or company intelligence contains an error message (e.g., "Could not fetch content"), acknowledge this limitation and write the best possible proposal based on the available information.
  6. Conclude with a call to action for a "strategic conversation" or "exploratory dialogue" to discuss a potential partnership.

  Your final output must be ONLY the text of the letter, with nothing else.
  
FORMAT_OUTPUT_INSTRUCTIONS: "
CRITICAL: Format all text output for professional copy-paste use:
- Insert two line breaks between paragraphs.
- Add a line break after the greeting.
- Add a line break before the closing.
- Add a line break after 'Sincerely,'.
- Add a line break before the name/title.
- The final output must be a single string. DO NOT use markdown, and use actual line breaks, not \\n characters.

Example structure:
Dear [Name],

[Paragraph 1]

[Paragraph 2]

[Paragraph 3]

Sincerely,

[Name]
[Title]

Apply this formatting to the complete response."
  `,
});

const coverLetterGeneratorFlow = ai.defineFlow(
  {
    name: 'coverLetterGeneratorFlow',
    inputSchema: CoverLetterGeneratorInputSchema,
    outputSchema: CoverLetterGeneratorOutputSchema,
  },
  async input => {
    // Read user profile from files
    const cvPath = path.join(process.cwd(), 'docs', 'cv', 'cv.md');
    const researchPath = path.join(process.cwd(), 'docs', 'cv', 'research.md');
    const cvContent = readFileSync(cvPath, 'utf-8');
    const researchContent = readFileSync(researchPath, 'utf-8');
    const userProfile = cvContent + '\n' + researchContent;

    // Step 1: Get company intelligence
    const companyIntelligence = await getCompanyIntelligenceTool(input);

    // Step 2: Get job description
    const jobDescription = await getJobDescriptionTool({ url: input.companyUrl });

    // Step 3: Generate the cover letter
    const { output } = await letterWritingPrompt({
      userProfile,
      companyIntelligence,
      jobDescription,
      jobTitle: input.jobTitle,
    });

    return {
      coverLetter: output!.coverLetter,
      companyIntelligence: companyIntelligence,
    };
  }
);
