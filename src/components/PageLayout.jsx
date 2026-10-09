import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function PageLayout({
  children,
  showBackButton = false,
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showBackButton={showBackButton} />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}