import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'media.tbauctions.com',
  'files.netbid.com',
  'www.industrial-auctions.com',
  'surplex.com',
  'troostwijkauctions.com',
  'maynards.com',
  'cdn.hibid.com',
  'hibid.com',
  'euroauctions.com',
  'euroauctions.co.uk',
  'auctioneersapps.com',
  'bidspotter.co.uk',
  'i-bidder.com',
];

const CACHE = new Map<string, { data: ArrayBuffer; contentType: string; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate domain
  try {
    const parsed = new URL(url);
    const isAllowed = ALLOWED_DOMAINS.some(d =>
      parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
    );
    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Check cache
  const cached = CACHE.get(url);
  if (cached && Date.now() < cached.expires) {
    return new NextResponse(cached.data, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=1800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Fetch and proxy
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/avif,image/jpeg,image/png,*/*',
        'Referer': 'https://www.google.com/',
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    // Cache
    CACHE.set(url, { data: arrayBuffer, contentType, expires: Date.now() + CACHE_TTL });

    // Limit cache size
    if (CACHE.size > 500) {
      const oldest = [...CACHE.entries()].sort((a, b) => a[1].expires - b[1].expires);
      for (let i = 0; i < 100; i++) {
        CACHE.delete(oldest[i][0]);
      }
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=1800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}