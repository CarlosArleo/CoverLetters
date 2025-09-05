
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

If the text content indicates a failure to retrieve information, please state that in the output fields.

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
    let fetchError = '';

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
    } catch (error: any) {
        console.error('Error fetching homepage:', error);
        fetchError = error.message;
    }

    if (!fetchError) {
        // Try to fetch about page, but don't fail if it doesn't exist
        try {
          const aboutUsUrl = new URL('/about', input.companyUrl).toString();
          const aboutUsResponse = await fetch(aboutUsUrl);
          if (aboutUsResponse.ok) {
            aboutUsHtml = await aboutUsResponse.text();
          }
        } catch (e) {
          // Ignore if about page doesn't exist or fails to fetch
        }
    }


    if (fetchError || (!homePageHtml && !aboutUsHtml)) {
      return {
        companyName: 'Error: URL Not Found',
        companyMission: `Could not fetch any content from the provided URL. The server may be down or the URL is incorrect. (Details: ${fetchError || 'N/A'})`,
        keyProjects: `Could not fetch any content from the provided URL. (Details: ${fetchError || 'N/A'})`,
      }
    }

    const homePageDom = new JSDOM(homePageHtml);
    const aboutUsDom = aboutUsHtml ? new JSDOM(aboutUsHtml) : null;

    const combinedText = `${
      homePageDom.window.document.body?.textContent || ''
    }\n${aboutUsDom?.window.document.body?.textContent || ''}`.trim();
    
    if (!combinedText) {
      return {
        companyName: 'Error: No Content',
        companyMission: 'No text content could be extracted from the URL.',
        keyProjects: 'No text content could be extracted from the URL.',
      }
    }

    const { output } = await companyIntelPrompt({
      textContent: combinedText,
    });

    return output!;
  }
);

export type CompanyIntelligenceTool = typeof getCompanyIntelligenceTool;
