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

const CoverLetterGeneratorInputSchema = z.object({
  companyUrl: z.string().describe('The URL of the company website or job posting.'),
  jobTitle: z.string().optional().describe('The job title for the application.'),
});

export type CoverLetterGeneratorInput = z.infer<typeof CoverLetterGeneratorInputSchema>;

const CoverLetterGeneratorOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});

export type CoverLetterGeneratorOutput = z.infer<typeof CoverLetterGeneratorOutputSchema>;


const GetCompanyIntelligenceToolInputSchema = z.object({
  companyUrl: z.string().describe('The URL of the company website to scrape.'),
});

const GetCompanyIntelligenceToolOutputSchema = z.object({
  name: z.string().describe('The name of the company.'),
  mission: z.string().describe('The mission of the company.'),
  keyProjects: z.string().describe('Key projects of the company.'),
});

const getCompanyIntelligenceTool = ai.defineTool({
  name: 'getCompanyIntelligenceTool',
  description: 'Scrapes a company website and extracts the company name, mission, and key projects.',
  inputSchema: GetCompanyIntelligenceToolInputSchema,
  outputSchema: GetCompanyIntelligenceToolOutputSchema,
}, async (input) => {
  // TODO: Implement web scraping and AI prompt to extract data
  // Placeholder implementation for demonstration purposes

  // Dummy data for testing, replace with actual implementation.
  return {
    name: 'Example Company',
    mission: 'To provide innovative solutions.',
    keyProjects: 'AI Development, Cloud Services',
  };
});


export async function coverLetterGenerator(input: CoverLetterGeneratorInput): Promise<CoverLetterGeneratorOutput> {
  return coverLetterGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: {schema: CoverLetterGeneratorInputSchema},
  output: {schema: CoverLetterGeneratorOutputSchema},
  tools: [getCompanyIntelligenceTool],
  prompt: `You are an expert cover letter writer. Use the provided information to create a compelling and personalized cover letter.

  User Profile (from cv.md and research.md): {{{userProfile}}}
  Company Information (from getCompanyIntelligenceTool): Name: {{{companyName}}}, Mission: {{{companyMission}}}, Key Projects: {{{companyKeyProjects}}}.
  Job Description: {{{jobDescription}}}

  Write a cover letter that is tailored to the job description and highlights the user's relevant skills and experience. Make sure to include information about the company's mission and key projects.
  Job Title: {{{jobTitle}}}
  Company URL: {{{companyUrl}}}
  `,// Added companyUrl, jobTitle for context
  system: `You are an expert at writing cover letters.  You will be given a job description, information about the company, and a user profile.  Your goal is to write a cover letter that is tailored to the job description and highlights the user's relevant skills and experience.  Use the getCompanyIntelligenceTool if the company name, mission, and key projects are not known.`,// Added a system prompt.
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

    // Scrape job description from URL
    // TODO: Implement web scraping logic here (or use a tool) to get the jobDescription
    const jobDescription = 'This is a placeholder for the job description scraped from the URL.';

    // Get company intelligence using the tool
    const companyIntelligence = await getCompanyIntelligenceTool({
      companyUrl: input.companyUrl,
    });

    const {output} = await prompt({
      ...input,
      userProfile: userProfile,
      companyName: companyIntelligence.name,
      companyMission: companyIntelligence.mission,
      companyKeyProjects: companyIntelligence.keyProjects,
      jobDescription: jobDescription, // Pass the scraped job description
    });

    return output!;
  }
);
