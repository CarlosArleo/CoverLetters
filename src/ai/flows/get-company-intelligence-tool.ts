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

export const getCompanyIntelligenceTool = ai.defineTool(
  {
    name: 'getCompanyIntelligence',
    description:
      'Retrieves company name, mission, and key projects from a company website by scraping its home and "about us" pages.',
    inputSchema: GetCompanyIntelligenceInputSchema,
    outputSchema: GetCompanyIntelligenceOutputSchema,
  },
  async (input) => {
    let homePageHtml = '';
    let aboutUsHtml = '';

    try {
      // Fetch homepage
      const homePageResponse = await fetch(input.companyUrl);
      if (!homePageResponse.ok) {
        console.warn(
          `Failed to fetch home page: ${homePageResponse.statusText}`
        );
        // Continue without it if it fails
      } else {
        homePageHtml = await homePageResponse.text();
      }

      // Try to fetch about page, but don't fail if it doesn't exist
      try {
        const aboutUsUrl = new URL('/about', input.companyUrl).toString();
        const aboutUsResponse = await fetch(aboutUsUrl);
        if (aboutUsResponse.ok) {
          aboutUsHtml = await aboutUsResponse.text();
        } else {
          console.warn(
            `Could not fetch about page at ${aboutUsUrl}, proceeding without it.`
          );
        }
      } catch (e) {
        console.warn(`Error fetching about page, proceeding without it:`, e);
      }

      if (!homePageHtml && !aboutUsHtml) {
        throw new Error('Could not fetch any content from the provided URL.');
      }

      const homePageDom = new JSDOM(homePageHtml);
      const aboutUsDom = aboutUsHtml ? new JSDOM(aboutUsHtml) : null;

      const combinedText = `${
        homePageDom.window.document.body?.textContent || ''
      }\n${aboutUsDom?.window.document.body?.textContent || ''}`;

      const { output } = await companyIntelPrompt({
        textContent: combinedText.trim(),
      });

      return output!;
    } catch (error: any) {
      console.error('Error in getCompanyIntelligence tool:', error);
      // Return a structured error that the calling flow can handle if needed,
      // or rethrow to be caught by the action handler.
      throw new Error(`Failed to extract company intelligence: ${error.message}`);
    }
  }
);

export type CompanyIntelligenceTool = typeof getCompanyIntelligenceTool;
