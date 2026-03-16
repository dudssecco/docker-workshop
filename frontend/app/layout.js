import "./globals.css";

export const metadata = {
  title: "Lista de Tarefas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
