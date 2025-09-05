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
      throw new Error(`Failed to fetch job description: ${response.statusText}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    // A simple approach to get all text. More complex logic might be needed for specific sites.
    return dom.window.document.body.textContent || '';
  } catch (error: any) {
    console.error('Error in getJobDescriptionTool:', error);
    // Return a message indicating failure, which the main prompt can handle.
    return `Failed to retrieve job description from ${url}. Please check the URL.`;
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
  prompt: `You are an expert cover letter writer. Your task is to generate a personalized and compelling cover letter based on the provided user profile and job details.

User Profile (from cv.md and research.md):
{{{userProfile}}}

First, you MUST use the 'getCompanyIntelligence' tool with the provided 'companyUrl' to get the company's name, mission, and key projects.
Next, you MUST use the 'getJobDescription' tool with the same 'companyUrl' to scrape the full text of the job description.

Once you have the company intelligence and the job description, synthesize all the information: the user's profile, the company's details, and the job requirements.

Write a cover letter that is highly tailored to the job description, highlighting the user's most relevant skills and experiences. Directly reference the company's mission and/or key projects to show genuine interest.

The final output should only be the text of the cover letter.

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
