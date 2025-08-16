export const metadata = { title: "People Management" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Segoe UI, Arial, sans-serif", padding: 20 }}>
        <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/schedule">Schedule</a>
          <a href="/maps">Maps</a>
          <a href="/admin/flags">Flags</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
