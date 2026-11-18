// src/components/Footer.tsx
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} HSE Manager. All rights reserved.</p>
      <p>Powered by <strong>ThickDev</strong></p>
    </footer>
  );
}