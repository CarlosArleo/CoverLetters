import {NextResponse} from 'next/server';
import { z } from 'zod';
import { ai } from '@/ai/genkit';


const hunterTool = ai.defineTool(
    {
      name: 'hunterEmailFinder',
      description:
        'Finds email addresses for a given domain using the Hunter.io API. Requires a Hunter API key set as HUNTER_API_KEY environment variable.',
      inputSchema: z.object({
        domain: z.string().describe('The domain name to search for emails.'),
      }),
      outputSchema: z.any(),
    },
    async (input) => {
      const apiKey = process.env.HUNTER_API_KEY;
      if (!apiKey) {
        throw new Error('HUNTER_API_KEY environment variable not set.');
      }
      const url = `https://api.hunter.io/v2/domain-search?domain=${input.domain}&api_key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Hunter API request failed: ${response.statusText}`);
      }
      return await response.json();
    }
  );


export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      {error: 'Domain parameter is required'},
      {status: 400}
    );
  }

  try {
    const contacts = await hunterTool({ domain });
    return NextResponse.json(contacts);
  } catch(error: any) {
    console.error("Error calling hunter tool:", error);
     // Return a mock response if the API key is not set or another error occurs, so the app is still usable.
    const mockContacts = {
        data: {
          domain: domain,
          emails: [
            {
              value: `jane.doe@${domain}`,
              first_name: 'Jane',
              last_name: 'Doe',
              position: 'CEO',
              confidence: 95,
            },
            {
              value: `s.smith@${domain}`,
              first_name: 'Sam',
              last_name: 'Smith',
              position: 'CTO',
              confidence: 92,
            },
            {
              value: `recruiting@${domain}`,
              first_name: null,
              last_name: null,
              position: 'Recruiting Department',
              confidence: 88,
            },
          ],
        },
      };
      return NextResponse.json(mockContacts, { status: 500, statusText: "Could not connect to contact discovery service. Using mock data."});
  }

}
