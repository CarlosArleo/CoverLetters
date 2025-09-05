
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
  prompt: `You are an expert career strategist drafting a peer-to-peer professional outreach email.

  CONTEXT:
  - Cover Letter: {{{coverLetter}}}
  - Job Title: {{{jobTitle}}}
  - Company Name: {{{companyName}}}

  YOUR TASK:
  Draft a concise and professional email with a subject and body. The email should be a peer-to-peer proposal for a strategic conversation, not a standard job application.

  EMAIL STRUCTURE AND TONE:
  1.  **Subject Line:** Create a professional subject line. If a job title is provided, use it. Otherwise, use a title like "Exploring Synergies: Regenerative Development & [Company Name]".
  2.  **Greeting:** Use a standard professional greeting.
  3.  **Paragraph 1 (The Hook):** Start with a brief, genuine connection to the company's mission or work, drawing from the sentiment in the cover letter.
  4.  **Paragraph 2 (The Bridge & Line):** Begin by clearly stating the purpose of the email (e.g., "I am reaching out to explore..."). Then, concisely state the unique value proposition from the cover letter, highlighting both domain expertise and proprietary AI tools.
  5.  **Paragraph 3 (The Sinker):** Reference the attached cover letter and CV for details. The "ask" for a conversation must be framed as a forward-looking offer of collaboration and connect the consultant's expertise to the company's specific projects mentioned in the cover letter to create relevance.
  6.  **Closing:** End with a professional closing like "Sincerely," followed by the consultant's name and title.

  CRITICAL FORMATTING INSTRUCTIONS:
  - The final output must be a clean JSON object with "subject" and "body" keys.
  - The "body" text must be ready to copy and paste. Use actual line breaks between paragraphs (a double line break). Do not use "\\n" characters.
  
  Example Body Structure:
  Dear [Hiring Manager],
  
  [Paragraph 1]
  
  [Paragraph 2]
  
  [Paragraph 3]
  
  Sincerely,
  
  [Name]
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

