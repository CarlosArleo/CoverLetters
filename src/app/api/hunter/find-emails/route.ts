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
    // If there is an error, return it to the client instead of using mock data.
    return NextResponse.json(
        { error: `Failed to fetch contacts: ${error.message}` },
        { status: 500 }
    );
  }
}
