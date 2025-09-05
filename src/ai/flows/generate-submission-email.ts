
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

  EMAIL STRUCTURE (THE "HOOK, BRIDGE, LINE, SINKER" MODEL):
  1.  Subject Line: Create a professional subject line. If a job title is provided, use it. Otherwise, use a title like "Exploring Synergies: Regenerative Development & [Company Name]".
  2.  The Hook (Paragraph 1): Start with a brief, genuine connection to the company's mission or work, drawing from the sentiment in the cover letter.
  3.  The Bridge & The Line (Paragraph 2): Begin this paragraph with a clear statement of purpose, framing the outreach as an exploration of synergies (e.g., "I am reaching out to explore..."). Immediately follow this with a concise, one-sentence summary of the unique value proposition presented in the cover letter, highlighting both the domain expertise and the proprietary AI tools.
  4.  Reference Attachments (Paragraph 3): Clearly state that the attached cover letter and CV provide comprehensive details.
  5.  The Sinker (Paragraph 4): The "ask" for a conversation must be framed as a forward-looking offer of collaboration. The prompt for the conversation should explicitly connect the consultant's expertise to the company's specific, named projects (from the company intelligence) to create a sense of urgency and relevance.
  6.  Closing: End with a professional closing.

  Your final output must be a JSON object with two keys: "subject" and "body".
  
FORMAT_OUTPUT_INSTRUCTIONS: "
CRITICAL: Format all text output for professional copy-paste use:
- Insert two line breaks between paragraphs.
- Add a line break after the greeting.
- Add a line break before the closing.
- Add a line break after 'Sincerely,'.
- Add a line break before the name/title.
- Do NOT use any '\\n' characters in the output. The output string must contain actual line breaks, not the '\\n' escape sequence.
- Ensure all spacing is clean and professional.

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
