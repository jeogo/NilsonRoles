import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the domain from the URL parameters
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  
  // Validate domain parameter
  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }
  
  try {
    // API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_API_KEY_4;
    
    // Make the request to URLScan.io from the server
    const response = await fetch(`https://urlscan.io/api/v1/search?q=domain:${encodeURIComponent(domain)}`, {
      headers: {
        'API-Key': apiKey || '',
        'Accept': 'application/json',
      },
      cache: 'no-store' // Don't cache the response
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `URLScan API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Try to parse the JSON response
    try {
      const data = await response.json();
      
      // Add CORS headers to allow browser access
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON response from URLScan API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('URLScan proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
