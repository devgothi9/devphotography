export const metadata = {
  title: "Dev Gothi Photography — Ottawa",
  description:
    "Photography & photo editing in Ottawa. Weddings, portraits, events, brand shoots.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
