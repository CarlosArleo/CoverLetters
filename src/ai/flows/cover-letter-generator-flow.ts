// src/ai/flows/cover-letter-generator-flow.ts
'use server';

/**
 * @fileOverview Generates a personalized cover letter for a job application.
 *
 * - coverLetterGenerator - A function that generates the cover letter.
 * - CoverLetterGeneratorInput - The input type for the coverLetterGenerator function.
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
      // Instead of throwing, return a clear failure message.
      // The LLM can then report that it couldn't get the description.
      const errorText = `Failed to fetch job description. Status: ${response.status} ${response.statusText}`;
      console.error(errorText);
      return errorText;
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    // A simple approach to get all text. More complex logic might be needed for specific sites.
    const textContent = dom.window.document.body.textContent || '';
    if (!textContent.trim()) {
      return `No text content found at the provided URL: ${url}`;
    }
    return textContent;
  } catch (error: any) {
    console.error('Error in getJobDescriptionTool:', error);
    // Return a message indicating failure, which the main prompt can handle.
    return `Failed to retrieve job description from ${url}. The URL might be invalid or the server unreachable.`;
  }
});


export async function coverLetterGenerator(input: CoverLetterGeneratorInput): Promise<CoverLetterGeneratorOutput> {
  return coverLetterGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: {schema: z.object({
    userProfile: z.string(),
    companyUrl: z.string(),
    jobTitle: z.string().optional(),
  })},
  output: {schema: CoverLetterGeneratorOutputSchema},
  tools: [getCompanyIntelligenceTool, getJobDescriptionTool],
  prompt: `You are an expert career strategist and cover letter writer. Your task is to generate a highly personalized and compelling cover letter by following these steps:

Step 1: Company and Job Analysis
- Use the 'getCompanyIntelligence' tool with the provided 'companyUrl' to understand the company's name, mission, and key projects.
- Use the 'getJobDescription' tool with the same 'companyUrl' to get the full text of the job description. If you receive an error message from this tool, note that the job description could not be retrieved and proceed without it.

Step 2: Synthesis
- Analyze the user's profile provided below.
- Analyze the company intelligence you retrieved.
- Analyze the job description you retrieved. If the description is unavailable, focus on the alignment between the user's profile and the company's mission and projects.
- Identify the key skills, experiences, and values from the user's profile that are most relevant to the job description (if available) and the company's mission.

Step 3: Write the Cover Letter
- Based on your synthesis, write a professional and compelling cover letter.
- The letter must be highly tailored. If the job description is available, directly reference its specific requirements and connect them to the user's experiences.
- Mention the company's mission or a specific project to demonstrate genuine interest and a good fit.
- If the job description was not available, state that you are writing to express interest in the company based on its mission and projects and how your skills could be a valuable asset.
- The tone should be professional, confident, and aligned with the user's extensive experience.

Your final output should be ONLY the text of the cover letter, with nothing else.

User Profile (from cv.md and research.md):
{{{userProfile}}}

Job Title: {{{jobTitle}}}
Company/Job URL: {{{companyUrl}}}
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

    const {output} = await prompt({
      ...input,
      userProfile,
    });

    return output!;
  }
);
