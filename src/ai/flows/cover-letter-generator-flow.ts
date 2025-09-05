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
  name: 'getJobDescriptionTool',
  description: 'Scrapes a job posting URL to extract the full job description text.',
  inputSchema: z.object({ jobUrl: z.string().url() }),
  outputSchema: z.string(),
}, async ({ jobUrl }) => {
  try {
    const response = await fetch(jobUrl);
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
    return `Failed to retrieve job description from ${jobUrl}. Please check the URL.`;
  }
});

export async function coverLetterGenerator(input: CoverLetterGeneratorInput): Promise<CoverLetterGeneratorOutput> {
  return coverLetterGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: {schema: z.object({
    userProfile: z.string(),
    companyName: z.string(),
    companyMission: z.string(),
    companyKeyProjects: z.string(),
    jobDescription: z.string(),
    jobTitle: z.string().optional(),
    companyUrl: z.string(),
  })},
  output: {schema: CoverLetterGeneratorOutputSchema},
  tools: [getCompanyIntelligenceTool, getJobDescriptionTool],
  prompt: `You are an expert cover letter writer. Use the provided information to create a compelling and personalized cover letter.

  User Profile (from cv.md and research.md): {{{userProfile}}}
  Company Information (from getCompanyIntelligenceTool): Name: {{{companyName}}}, Mission: {{{companyMission}}}, Key Projects: {{{companyKeyProjects}}}.
  Job Description: {{{jobDescription}}}

  Write a cover letter that is tailored to the job description and highlights the user's relevant skills and experience. Make sure to include information about the company's mission and key projects.
  Job Title: {{{jobTitle}}}
  Company URL: {{{companyUrl}}}
  `,
  system: `You are an expert at writing cover letters. You will be given a user profile and a job title. You MUST use the getCompanyIntelligenceTool to learn about the company and the getJobDescriptionTool to get the full job description from the provided URL. Your goal is to write a cover letter that is tailored to the job description and highlights the user's relevant skills and experience.`,
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

    // The AI will call the tools as needed based on the system prompt.
    // We get company intelligence and job description via tools.
    const companyIntelligence = await getCompanyIntelligenceTool({ companyUrl: input.companyUrl });
    const jobDescription = await getJobDescriptionTool({ jobUrl: input.companyUrl });

    const {output} = await prompt({
      ...input,
      userProfile,
      companyName: companyIntelligence.companyName,
      companyMission: companyIntelligence.companyMission,
      companyKeyProjects: companyIntelligence.keyProjects,
      jobDescription,
    });

    return output!;
  }
);
