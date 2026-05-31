import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Logistics Manager',
  description: 'Intelligent delivery dispatch and fleet management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}