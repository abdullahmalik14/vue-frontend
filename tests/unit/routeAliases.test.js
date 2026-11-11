import { describe, it, expect } from 'vitest';
import {
  buildLocaleOptionalRoutePath,
  buildLocaleParamSegment,
  buildVueRouterAliases,
  createRedirectFromRouteRecords,
  findDuplicateRoutePathClaims,
  normalizeRoutePath,
  routeConfigMatchesPath,
} from '../../src/systems/routing/routeAliases.js';

describe('routeAliases (M8)', () => {
  it('normalizeRoutePath adds a leading slash', () => {
    expect(normalizeRoutePath('login')).toBe('/login');
    expect(normalizeRoutePath('/login')).toBe('/login');
    expect(normalizeRoutePath('  ')).toBeNull();
  });

  it('buildLocaleOptionalRoutePath prefixes constrained optional locale param', () => {
    const localeParam = buildLocaleParamSegment(['en', 'vi']);
    expect(buildLocaleOptionalRoutePath('/login', ['en', 'vi'])).toBe(`/${localeParam}/login`);
    expect(buildLocaleOptionalRoutePath('/', ['en', 'vi'])).toBe(`/${localeParam}`);
  });

  it('buildLocaleOptionalRoutePath does not treat auth slugs as home locale', () => {
    expect(buildLocaleOptionalRoutePath('/')).not.toBe('/:locale?/');
    expect(buildLocaleOptionalRoutePath('/sign-up')).toContain('/sign-up');
  });

  it('buildVueRouterAliases maps config aliases to router aliases', () => {
    const aliases = buildVueRouterAliases(['/home', 'dashboard']);
    expect(aliases[0]).toContain('/home');
    expect(aliases[1]).toContain('/dashboard');
    expect(aliases[0]).not.toBe('/:locale?/home');
  });

  it('routeConfigMatchesPath resolves slug and aliases', () => {
    const route = {
      slug: '/log-in',
      aliases: ['/sign-in'],
    };

    expect(routeConfigMatchesPath(route, '/log-in')).toBe(true);
    expect(routeConfigMatchesPath(route, '/sign-in')).toBe(true);
    expect(routeConfigMatchesPath(route, '/login')).toBe(false);
  });

  it('createRedirectFromRouteRecords builds locale-aware redirects', () => {
    const records = createRedirectFromRouteRecords(
      { slug: '/log-in', redirectFrom: ['/login'] },
      {
        resolveLocaleFromRouteLocation: () => 'vi',
        buildLocaleAwareRedirectPath: (target, locale) => `/${locale}${target}`,
        supportedLocales: ['en', 'vi'],
      },
    );

    expect(records).toHaveLength(1);
    expect(records[0].path).toContain('/login');
    expect(records[0].path).not.toBe('/:locale?/login');
    expect(records[0].redirect({ path: '/vi/login', params: { locale: 'vi' } })).toBe('/vi/log-in');
  });

  it('findDuplicateRoutePathClaims detects cross-route path conflicts', () => {
    const duplicates = findDuplicateRoutePathClaims([
      { slug: '/log-in', aliases: ['/sign-in'] },
      { slug: '/dashboard', aliases: ['/sign-in'] },
    ]);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].path).toBe('/sign-in');
  });
});
