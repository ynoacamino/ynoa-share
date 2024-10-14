import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ynoa-share',
  description: 'Share your thoughts in real time with others',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-background text-foreground w-full min-h-screen overflow-hidden"
      >
        <main className="w-full min-h-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
