import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Madison AI Connect — Find Your Intellectual Match',
  description: 'Upload your AI memory. Get connected with students who share your deepest interests — powered by Claude.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
