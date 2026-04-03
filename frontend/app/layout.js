import "./globals.css"
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}