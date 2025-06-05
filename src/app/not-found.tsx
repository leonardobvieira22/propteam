import { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-white'>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
          <div className='mb-8 text-6xl'>🔍</div>
          <h1 className='mt-8 text-4xl md:text-6xl'>Page Not Found</h1>
          <Link href='/' className='mt-4 text-primary-600 underline'>
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
