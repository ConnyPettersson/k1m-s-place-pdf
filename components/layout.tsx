import type { Metadata } from 'next';
import '../public/styles/globals.css';

export const metadata: Metadata = {
  title: 'K1Ms place pdf',
  description: 'AI-based parental advisor that read from pdf-files',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-grow">
          <div className="max-w-2xl mx-auto w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
