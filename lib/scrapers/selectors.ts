export interface PlatformSelectors {
  listing: string;
  title: string;
  link: string;
  image: string;
  price: string;
  endDate: string;
  location: string;
  lotId?: string;
}

export const SELECTORS: Record<string, { primary: PlatformSelectors; fallback: PlatformSelectors }> = {
  netbid: {
    primary: {
      listing: 'ul[data-testid="auction-list"] > li, ul.space-y-4 > li',
      title: 'h3, h2, [class*="title"]',
      link: 'a[href^="/en/auctions/"]',
      image: 'img',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: 'p, [class*="location"]',
    },
    fallback: {
      listing: 'li:has(a[href*="/auctions/"])',
      title: 'h3, h2, a[href*="/auctions/"]',
      link: 'a[href*="/auctions/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'p, span',
    },
  },
  industrial: {
    primary: {
      listing: '[class*="auction"], [class*="lot"], div:has(> a[href^="/auctions/"])',
      title: 'h3, h2, a[href^="/auctions/"]',
      link: 'a[href^="/auctions/"]',
      image: 'img',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: '[class*="location"], p',
    },
    fallback: {
      listing: 'a[href*="/auctions/"]',
      title: 'a[href*="/auctions/"]',
      link: 'a[href*="/auctions/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
  bidspotter: {
    primary: {
      listing: '[class*="auction-card"], [class*="lot-item"], [class*="search-result"]',
      title: '[class*="title"], h3, h2',
      link: 'a[href*="/catalog/"]',
      image: 'img',
      price: '[class*="price"], [class*="bid"], [class*="current"]',
      endDate: 'time, [class*="date"], [class*="end"], [class*="closing"]',
      location: '[class*="location"], [class*="address"]',
    },
    fallback: {
      listing: 'li:has(a[href*="/catalog/"]), div:has(a[href*="/catalog/"])',
      title: 'a[href*="/catalog/"], h3',
      link: 'a[href*="/catalog/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
  euroAuctions: {
    primary: {
      listing: '[class*="auction"], [class*="lot"], div:has(> a[href*="/auction/"])',
      title: 'h3, h2, a[href*="/auction/"]',
      link: 'a[href*="/auction/"]',
      image: 'img',
      price: '[class*="price"], [class*="bid"]',
      endDate: 'time, [class*="date"], [class*="end"]',
      location: '[class*="location"], p',
    },
    fallback: {
      listing: 'a[href*="/auction/"]',
      title: 'a[href*="/auction/"]',
      link: 'a[href*="/auction/"]',
      image: 'img',
      price: 'span, div',
      endDate: 'time, span',
      location: 'span, p',
    },
  },
};