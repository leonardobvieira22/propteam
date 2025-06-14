import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Components',
  description: 'Pre-built components with enterprise styling',
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
