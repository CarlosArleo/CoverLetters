'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a submission email.
 *
 * The flow takes the cover letter, job title, and company name as input and generates a draft submission email.
 * - generateSubmissionEmail - A function that generates a draft submission email.
 * - GenerateSubmissionEmailInput - The input type for the generateSubmissionEmail function.
 * - GenerateSubmissionEmailOutput - The return type for the generateSubmissionEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSubmissionEmailInputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
  jobTitle: z.string().describe('The job title for the application.'),
  companyName: z.string().describe('The name of the company.'),
});

export type GenerateSubmissionEmailInput = z.infer<
  typeof GenerateSubmissionEmailInputSchema
>;

const GenerateSubmissionEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the submission email.'),
  body: z.string().describe('The body of the submission email.'),
});

export type GenerateSubmissionEmailOutput = z.infer<
  typeof GenerateSubmissionEmailOutputSchema
>;

export async function generateSubmissionEmail(
  input: GenerateSubmissionEmailInput
): Promise<GenerateSubmissionEmailOutput> {
  return generateSubmissionEmailFlow(input);
}

const generateSubmissionEmailPrompt = ai.definePrompt({
  name: 'generateSubmissionEmailPrompt',
  input: {
    schema: GenerateSubmissionEmailInputSchema,
  },
  output: {
    schema: GenerateSubmissionEmailOutputSchema,
  },
  prompt: `You are an AI assistant specialized in writing professional job application emails.

  Given the following cover letter, job title, and company name, generate a concise and compelling submission email.
  The email should have a subject line and a body. The email should be professional and tailored to the job and company.

  Cover Letter: {{{coverLetter}}}
  Job Title: {{{jobTitle}}}
  Company Name: {{{companyName}}}

  Subject: (Write an appropriate email subject line here)
  Body: (Write the body of the email here)
  `,
});

const generateSubmissionEmailFlow = ai.defineFlow(
  {
    name: 'generateSubmissionEmailFlow',
    inputSchema: GenerateSubmissionEmailInputSchema,
    outputSchema: GenerateSubmissionEmailOutputSchema,
  },
  async input => {
    const {output} = await generateSubmissionEmailPrompt(input);
    return output!;
  }
);
