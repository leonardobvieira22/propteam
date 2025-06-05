import { siteConfig } from '@/constant/config';

/**
 * Add Open Graph image to your page
 * Don't forget to add the domain to your next.config.js
 */
export function openGraph({
  path: _path,
  title = siteConfig.title,
  description = siteConfig.description,
  templateTitle,
}: {
  path: string;
  title?: string;
  description?: string;
  templateTitle?: string;
}): string {
  const ogTitle = templateTitle
    ? `${templateTitle} | ${siteConfig.title}`
    : title;

  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(
    ogTitle,
  )}&description=${encodeURIComponent(description)}`;

  return ogUrl;
}
