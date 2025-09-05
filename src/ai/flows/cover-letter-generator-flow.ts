
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
  prompt: `You are an expert career strategist and cover letter writer. Your task is to generate a highly personalized and compelling cover letter by synthesizing the provided information.

  User's Profile:
  {{{userProfile}}}

  Company Intelligence:
  - Company Name: {{{companyIntelligence.companyName}}}
  - Company Mission: {{{companyIntelligence.companyMission}}}
  - Key Projects: {{{companyIntelligence.keyProjects}}}

  Job Description:
  {{{jobDescription}}}

  Job Title: {{{jobTitle}}}

  Instructions:
  - Analyze the user's profile, the company intelligence, and the job description.
  - If the company intelligence or job description contains an error message (e.g., "Could not fetch content", "Failed to extract"), it means the information could not be retrieved. Acknowledge this limitation and write the best letter you can with the available information. For example, if company details are missing, address the letter more generally.
  - Write a professional and compelling cover letter.
  - The letter must be highly tailored. If the job description is available and does not contain an error, directly reference its specific requirements and connect them to the user's experiences.
  - If company intelligence is available and does not contain an error, mention the company's mission or a specific project to demonstrate genuine interest and a good fit.
  - If the job description was not available or could not be retrieved, state that you are writing to express interest in the company based on its mission and projects and how your skills could be a valuable asset.
  - The tone should be professional, confident, and aligned with the user's extensive experience.

  Your final output should be ONLY the text of the cover letter, with nothing else.
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
