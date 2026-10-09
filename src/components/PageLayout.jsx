import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function PageLayout({
  children,
  showBackButton = false,
}) {
  return (
    <div className="app-layout">
      <Navbar showBackButton={showBackButton} />

      <main className="page-main">
        {children}
      </main>

      <Footer />
    </div>
  );
}
