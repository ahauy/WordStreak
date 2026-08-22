import { getAllowedOrigins, isOriginAllowed } from './main';

describe('CORS Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getAllowedOrigins', () => {
    it('should parse and trim origins from CORS_ORIGINS and CLIENT_URL', () => {
      process.env.CORS_ORIGINS = 'https://custom1.com, https://custom2.com ';
      process.env.CLIENT_URL = 'https://client.com';

      const origins = getAllowedOrigins();
      expect(origins).toEqual([
        'https://custom1.com',
        'https://custom2.com',
        'https://client.com',
      ]);
    });

    it('should handle empty or undefined environment variables', () => {
      delete process.env.CORS_ORIGINS;
      delete process.env.CLIENT_URL;

      const origins = getAllowedOrigins();
      expect(origins).toEqual([]);
    });
  });

  describe('isOriginAllowed', () => {
    const customAllowedOrigins = [
      'https://wordstreak.app',
      'https://staging.wordstreak.app',
    ];

    describe('1. Requests with no origin', () => {
      it('should allow undefined origin (server-to-server, curl, health checks)', () => {
        expect(isOriginAllowed(undefined, customAllowedOrigins)).toBe(true);
      });

      it('should allow empty string origin', () => {
        expect(isOriginAllowed('', customAllowedOrigins)).toBe(true);
      });
    });

    describe('2. Explicitly listed origins', () => {
      it('should allow origins present in allowedOrigins list', () => {
        expect(
          isOriginAllowed('https://wordstreak.app', customAllowedOrigins),
        ).toBe(true);
        expect(
          isOriginAllowed(
            'https://staging.wordstreak.app',
            customAllowedOrigins,
          ),
        ).toBe(true);
      });

      it('should reject unlisted non-matching origins', () => {
        expect(
          isOriginAllowed(
            'https://unauthorized-domain.com',
            customAllowedOrigins,
          ),
        ).toBe(false);
      });
    });

    describe('3. Any https://*.vercel.app domain', () => {
      it('should allow the user vercel domain https://wordstreak-nu.vercel.app', () => {
        expect(
          isOriginAllowed(
            'https://wordstreak-nu.vercel.app',
            customAllowedOrigins,
          ),
        ).toBe(true);
      });

      it('should allow dynamic preview vercel domains', () => {
        expect(
          isOriginAllowed(
            'https://wordstreak-git-feature-nu.vercel.app',
            customAllowedOrigins,
          ),
        ).toBe(true);
        expect(
          isOriginAllowed('https://my-app.vercel.app', customAllowedOrigins),
        ).toBe(true);
      });

      it('should allow https://vercel.app root domain', () => {
        expect(
          isOriginAllowed('https://vercel.app', customAllowedOrigins),
        ).toBe(true);
      });

      it('should reject non-https vercel domains', () => {
        expect(
          isOriginAllowed(
            'http://wordstreak-nu.vercel.app',
            customAllowedOrigins,
          ),
        ).toBe(false);
      });

      it('should reject domains that spoof vercel.app at subdomain or path level', () => {
        expect(
          isOriginAllowed(
            'https://wordstreak-nu.vercel.app.attacker.com',
            customAllowedOrigins,
          ),
        ).toBe(false);
        expect(
          isOriginAllowed('https://attackervercel.app', customAllowedOrigins),
        ).toBe(false);
      });
    });

    describe('4. Any chrome-extension:// origin', () => {
      it('should allow chrome extension origins', () => {
        expect(
          isOriginAllowed(
            'chrome-extension://abcdefghijklmnop',
            customAllowedOrigins,
          ),
        ).toBe(true);
        expect(
          isOriginAllowed(
            'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn',
            customAllowedOrigins,
          ),
        ).toBe(true);
      });
    });

    describe('5. http://localhost:* for local development', () => {
      it('should allow localhost on any port', () => {
        expect(
          isOriginAllowed('http://localhost:5173', customAllowedOrigins),
        ).toBe(true);
        expect(
          isOriginAllowed('http://localhost:3000', customAllowedOrigins),
        ).toBe(true);
        expect(
          isOriginAllowed('http://localhost:8080', customAllowedOrigins),
        ).toBe(true);
        expect(isOriginAllowed('http://localhost', customAllowedOrigins)).toBe(
          true,
        );
      });

      it('should allow 127.0.0.1 for local development', () => {
        expect(
          isOriginAllowed('http://127.0.0.1:5173', customAllowedOrigins),
        ).toBe(true);
        expect(
          isOriginAllowed('http://127.0.0.1:3000', customAllowedOrigins),
        ).toBe(true);
      });

      it('should reject non-localhost http origins', () => {
        expect(
          isOriginAllowed('http://not-localhost.com', customAllowedOrigins),
        ).toBe(false);
        expect(
          isOriginAllowed('http://example.com:5173', customAllowedOrigins),
        ).toBe(false);
      });
    });
  });
});
