import "./globals.css";
import ThemeProvider from "./(public)/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}