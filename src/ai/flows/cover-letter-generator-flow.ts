
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
  prompt: `You are an expert business development strategist and communications consultant, writing on behalf of a high-level regenerative design professional. Your task is to draft a compelling letter of introduction that positions the consultant as a strategic partner, not just a job applicant.

POSITIONING FRAMEWORK:
- Position as a strategic consultant/collaborator, NOT a job candidate.
- Focus on specific, high-value consultancy services the user can provide, leveraging their proprietary AI tools and research.
- Emphasize geographic flexibility (based in Newcastle, available for remote/hybrid collaboration).
- Frame this as a business development opportunity or a proposal for partnership.

LANGUAGE & COMMUNICATION STRATEGY:
- Use peer-to-peer language like "contribute to your initiatives," "strategic collaboration," and "partnership opportunity."
- AVOID submissive language like "ideal candidate," "job opening," or "my application."
- Simplify jargon: Identify technical terms (e.g., "biomimetic AI," "planetary urbanisation," "regenerative loops," "Firebase Genkit") and either replace them with accessible language (e.g., "nature-inspired AI" for "biomimetic AI," "self-correcting AI systems" for "regenerative loops," "cloud-based AI framework" for "Firebase Genkit") or provide a brief, clear explanation of their value (e.g., "regenerative loops ensure adaptability and precision in data analysis").
- Highlight quantifiable success: If the consultant's profile mentions specific, measurable outcomes (e.g., "accelerating a process by 70%," "reducing qualitative coding time by 75%"), feature these as proof of value.

INPUTS FOR ANALYSIS:
1. Consultant's Profile: {{{userProfile}}}
2. Target Company Intelligence: {{{companyIntelligence.companyName}}}, {{{companyIntelligence.companyMission}}}, {{{companyIntelligence.keyProjects}}}
3. Opportunity Context (Job Description, if any): {{{jobDescription}}}

YOUR TASK:
1. Synthesize all inputs to find the strongest synergy between the consultant's unique skills and the company's specific needs and projects.
2. Draft a formal letter of introduction. Address it to a specific person if their name can be inferred, otherwise use a professional placeholder like "Dear [Company Name] Team,".
3. The letter must NOT read like a job application. It should be a proactive proposal for collaboration.
4. Weave a clear narrative:
  a. Start by establishing a genuine connection to the company's mission or specific projects.
  b. Clearly state the consultant's unique value proposition, connecting their deep experience with their innovative AI platforms. Specifically, highlight:
    - Technical Architecture: The use of cloud-based AI frameworks (e.g., Firebase Genkit, Google AI Studio) and nature-inspired AI systems (e.g., self-correcting regenerative loops) for processing multimodal data (text, geospatial, visual).
    - Key Features: Include relevant tools like the Geospatial Intelligence Module for GIS enhancement, Disparate Impact Identification System for equity and biodiversity impact simulations, and Core Data Pipeline for automated analysis—tie these to the company's projects (e.g., GMSF allocations, biodiversity net gain).
    - Ethical and Regenerative Aspects: Emphasize human-in-the-loop oversight, transparency (e.g., audit trails), and biomimetic principles (e.g., adaptability, negentropy) to align with the company's ecological and social goals.
    - Phased Roadmap: Mention a scalable development plan (e.g., MVP in 3-6 months, full deployment in 9-12 months) and propose co-developing custom features.
  c. If the consultant's profile contains quantifiable results, integrate them to substantiate claims (e.g., "reducing analysis time by 75%").
5. Strengthen the closing: Conclude with a concrete next step. Propose a specific, brief call (e.g., "a 15-minute call next week") to discuss how the AI platforms can directly support their stated projects or goals. Optionally suggest attaching a detailed proposal (e.g., "Masterplanning for Democracy AI Platform") if relevant.
6. Handle errors gracefully: If any input contains an error message (e.g., "Could not fetch content"), acknowledge the limitation and write the best possible proposal based on the available information.

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
