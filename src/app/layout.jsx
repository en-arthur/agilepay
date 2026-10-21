import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'AgilePay - Global Collections for African Businesses',
  description:
    'Accept payments from anywhere via Card, Mobile Money, or Crypto. Settle instantly to local MoMo or bank accounts with 3 lines of code or simple no-code links.',
  keywords: 'payment gateway, fintech, mobile money, mtn momo, telecel cash, stablecoin, usdc, base network, ghana, nigeria, kenya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-body)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white">
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
