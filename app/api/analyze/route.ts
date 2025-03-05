import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // PageSpeed API with retry and fallback
    const pagespeedData = await fetchWithRetry(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&key=${process.env.NEXT_PUBLIC_API_KEY_1}`,
      3
    );

    // Use simpler W3C validator endpoint
    const cssValidatorData = await fetchWithRetry(
      `https://validator.w3.org/nu/?doc=${encodeURIComponent(url)}&out=json`,
      2
    );

    return NextResponse.json({
      pagespeed: pagespeedData,
      cssvalidator: cssValidatorData,
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

async function fetchWithRetry(url: string, retries: number): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NielsenAnalyzer/1.0)'
        }
      });

      if (response.ok) {
        return response.json();
      }

      // If we get a 4xx error, don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`API returned ${response.status}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
