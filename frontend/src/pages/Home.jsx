import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Fingerprint, Search } from "lucide-react";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <nav className="home-nav">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Fingerprint size={22} />
          </div>

          <div className="brand-name">
            Digital<span>Detective</span>
          </div>
        </Link>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>

          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="hero">
        <section className="hero-content fade-in">
          <div className="hero-tag">
            <span className="live-dot"></span>
            Investigation System Online
          </div>

          <h1>
            Every clue
            <br />
            leaves a <span>trace.</span>
          </h1>

          <p className="hero-description">
            Digital Detective brings cases, evidence, suspects, clues,
            timelines and investigation activity into one intelligent
            command center.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Start Investigation
              <ArrowRight size={17} />
            </Link>

            <Link to="/login" className="btn btn-secondary">
              Access Command Center
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Case Monitoring</span>
            </div>

            <div className="hero-stat">
              <strong>100%</strong>
              <span>Centralized Evidence</span>
            </div>

            <div className="hero-stat">
              <strong>∞</strong>
              <span>Investigation Records</span>
            </div>
          </div>
        </section>

        <section className="hero-visual">
          <div className="radar">
            <div className="radar-line-horizontal"></div>
            <div className="radar-line-vertical"></div>
            <div className="radar-sweep"></div>

            <div className="radar-point point-one"></div>
            <div className="radar-point point-two"></div>
            <div className="radar-point point-three"></div>
          </div>

          <div className="scan-card">
            <div className="scan-header">
              <span>Live Analysis</span>
              <span className="scan-status">● ACTIVE</span>
            </div>

            <div className="scan-row">
              <span>
                <Search size={12} style={{ verticalAlign: "middle" }} />{" "}
                Network
              </span>
              <strong>Scanning</strong>
            </div>

            <div className="scan-row">
              <span>Evidence</span>
              <strong>247</strong>
            </div>

            <div className="scan-row">
              <span>Clues Found</span>
              <strong>38</strong>
            </div>

            <div className="scan-row">
              <span>
                <ShieldCheck
                  size={12}
                  style={{ verticalAlign: "middle" }}
                />{" "}
                Integrity
              </span>
              <strong className="text-success">Verified</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;