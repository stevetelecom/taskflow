/**
 * Pied de page.
 * Design sobre et professionnel : filet degrade aux couleurs du logo,
 * marque et mentions minmales (pas de details techniques).
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" alt="" className="footer-logo" />
          <span className="footer-name">TaskFlow</span>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} TaskFlow · Tous droits reserves
        </p>
      </div>
    </footer>
  );
}
