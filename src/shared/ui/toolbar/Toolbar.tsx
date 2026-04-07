import { useState } from "react";
import styles from './toolbar.module.css'

export default function Toolbar({navItems}) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Left */}
          <div className={styles.left}>
            <button
              className={styles.menuButton}
              onClick={() => setOpen(!open)}
            >
              {/*<Menu className={styles.icon} />*/}
              <span className={styles.logo}></span>
            </button>
          </div>

          {/* Center */}
          <nav className={styles.nav}>
            {navItems.map(({label, href}) => (
              <a key={label} href={href} className={styles.navItem}>
                {label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className={styles.right}>
            {/*<Search className={styles.icon} />*/}
          </div>
        </div>
      </div>

      {/* Mobile */}
      {open && (
        <div className={styles.mobileMenu}>
          {navItems.map(({label, href}) => (
            <a key={label} href={href} className={styles.mobileItem}>
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}







