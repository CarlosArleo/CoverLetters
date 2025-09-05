import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      {error: 'Domain parameter is required'},
      {status: 400}
    );
  }

  // In a real application, you would call the Hunter.io API here with an API key.
  // For this example, we return a mocked response.
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

  await new Promise(resolve => setTimeout(resolve, 1500));

  return NextResponse.json(mockContacts);
}
