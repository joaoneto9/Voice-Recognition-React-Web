import logolaudio from "../assets/logolaudio.png";
import "../style/style.css";

export function Header() {
  return (
    <header className="header">
      <img src={logolaudio} alt="Logo" className="header-logo" />
    </header>
  );
}
