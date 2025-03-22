import { Metadata } from 'next';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMonoFont = geistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'محلل نيلسون للمواقع',
  description: 'أداة لتحليل المواقع وفقاً لمبادئ نيلسون العشرة',
};

// Script to prevent theme flash on load
const themeInitScript = `
  (function() {
    function getInitialTheme() {
      const persistedTheme = localStorage.getItem('theme');
      const hasPersistedTheme = typeof persistedTheme === 'string';
      if (hasPersistedTheme) {
        return persistedTheme;
      }
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const hasMediaQueryPreference = typeof mql.matches === 'boolean';
      if (hasMediaQueryPreference) {
        return mql.matches ? 'dark' : 'light';
      }
      return 'light';
    }
    const theme = getInitialTheme();
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  })()
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMonoFont.variable} antialiased min-h-screen bg-background text-foreground transition-colors`}>
        <>{children}</>
      </body>
    </html>
  );
}
function Geist(arg0: { variable: string; subsets: string[]; }) {
  return { variable: arg0.variable };
}

function geistMono(arg0: { variable: string; subsets: string[]; }) {
  return { variable: arg0.variable };
}

