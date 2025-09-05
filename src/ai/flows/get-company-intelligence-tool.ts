'use server';

/**
 * @fileOverview A Genkit tool that extracts company intelligence from a website.
 *
 * - getCompanyIntelligenceTool - A function that extracts company intelligence.
 * - GetCompanyIntelligenceInput - The input type for the getCompanyIntelligenceTool function.
 * - GetCompanyIntelligenceOutput - The return type for the getCompanyIntelligenceTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {JSDOM} from 'jsdom';

const GetCompanyIntelligenceInputSchema = z.object({
  companyUrl: z
    .string()
    .url()
    .describe('The URL of the company website to extract intelligence from.'),
});
export type GetCompanyIntelligenceInput = z.infer<
  typeof GetCompanyIntelligenceInputSchema
>;

const GetCompanyIntelligenceOutputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  companyMission: z.string().describe('The mission of the company.'),
  keyProjects: z.string().describe('Key projects the company is working on.'),
});
export type GetCompanyIntelligenceOutput = z.infer<
  typeof GetCompanyIntelligenceOutputSchema
>;

const companyIntelPrompt = ai.definePrompt({
  name: 'companyIntelligencePrompt',
  input: {schema: z.object({textContent: z.string()})},
  output: {schema: GetCompanyIntelligenceOutputSchema},
  prompt: `You are an AI expert in understanding company information.

Given the following text content extracted from a company's website (including their home and about pages), extract the company's name, its mission statement, and any key projects or products mentioned.

Text Content:
{{{textContent}}}
`,
});

export const getCompanyIntelligenceTool =
  ai.defineTool(
    {
      name: 'getCompanyIntelligence',
      description: 'Retrieves company name, mission, and key projects from a company website by scraping its home and "about us" pages.',
      inputSchema: GetCompanyIntelligenceInputSchema,
      outputSchema: GetCompanyIntelligenceOutputSchema,
    },
    async input => {
      try {
        const aboutUsUrl = new URL('/about', input.companyUrl).toString();
        
        const [homePageResponse, aboutUsResponse] = await Promise.all([
          fetch(input.companyUrl),
          fetch(aboutUsUrl).catch(e => {
            console.warn(`Could not fetch about page at ${aboutUsUrl}, proceeding without it.`);
            return null;
          })
        ]);

        if (!homePageResponse.ok) {
          throw new Error(
            `Failed to fetch home page: ${homePageResponse.statusText}`
          );
        }
        
        const homePageHtml = await homePageResponse.text();
        const aboutUsHtml = (aboutUsResponse && aboutUsResponse.ok)
          ? await aboutUsResponse.text()
          : '';

        const homePageDom = new JSDOM(homePageHtml);
        const aboutUsDom = aboutUsHtml ? new JSDOM(aboutUsHtml) : null;

        const combinedText = `${
          homePageDom.window.document.body?.textContent || ''
        }\n${aboutUsDom?.window.document.body?.textContent || ''}`;
        
        const {output} = await companyIntelPrompt({
          textContent: combinedText.trim(),
        });

        return output!;
      } catch (error: any) {
        console.error('Error in getCompanyIntelligence tool:', error);
        throw new Error(
          `Failed to extract company intelligence: ${error.message}`
        );
      }
    }
  );

export type CompanyIntelligenceTool = typeof getCompanyIntelligenceTool;
