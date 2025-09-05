
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
  prompt: `You are an expert career strategist and communications coach. Your task is to draft a peer-to-peer professional outreach email.

  CONTEXT:
  - Cover Letter: {{{coverLetter}}}
  - Job Title: {{{jobTitle}}}
  - Company Name: {{{companyName}}}

  PSYCHOLOGICAL PRINCIPLES TO FOLLOW:
  - Use "conversation" language, never "meeting."
  - Position this as a peer-to-peer professional dialogue.
  - Frame the submission as an offer to explore mutual value.
  - Show genuine interest in their specific work/initiatives by referencing details from the cover letter.
  - Make the request for a "conversation" feel collaborative and low-pressure, not transactional.

  EMAIL STRUCTURE:
  1.  Subject Line: Create a professional subject line. If a job title is provided, use it. Otherwise, use a title like "A Conversation on Regenerative Systems & [Company Name]".
  2.  Personal Connection: Start with a brief, genuine connection to the company's mission or work, drawing from the sentiment in the cover letter.
  3.  Value Proposition: Write a concise, one-sentence summary of the unique value proposition presented in the cover letter.
  4.  Reference Attachments: Clearly state that the attached cover letter and CV provide comprehensive details.
  5.  The "Ask": Use collaborative language to request a brief conversation. For example: "I'd welcome the opportunity for a brief conversation about how my expertise might complement your current initiatives." or "I'd love to discuss how my background in [Relevant Area] could contribute to [Company Name]'s innovative work."
  6.  Closing: End with a professional closing.

  TEXT FORMATTING REQUIREMENTS:
  - Use proper paragraph breaks (double line breaks between paragraphs).
  - Include proper spacing after punctuation.
  - Format email addresses and contact details on separate lines if they appear in the closing.
  - Ensure clean, copy-paste ready output.
  - Add line breaks before and after key sections (greeting, body paragraphs, closing).
  - Use consistent spacing throughout.

  Your final output must be a JSON object with two keys: "subject" and "body".
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
