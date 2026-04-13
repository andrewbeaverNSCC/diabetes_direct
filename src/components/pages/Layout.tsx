import {Outlet, useNavigate} from "react-router";
import logo from '../../assets/DiabetesDirect.png';
import MegaMenu from "../layout/MegaMenu";

export default function Layout(){
    const navigate = useNavigate();
    return(
        <div className="container-fluid px-0 d-flex flex-column" style={{minHeight: '100vh'}}>
            {/*Header section*/}
            <header>
                <nav className="navbar navbar-expand-lg navbar-light bg-light w-100 shadow-sm" style={{borderBottom: '1px solid #e0e0e0', paddingTop: '1rem', paddingBottom: '1rem'}}>
                    <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
                        {/* Left side - Brand */}
                        <a className="navbar-brand d-flex align-items-center fw-bold" href="/" style={{fontSize: '2rem', flexShrink: 0, letterSpacing: '-0.5px'}}>
                            <img src={logo} alt="Diabetes Direct logo" height={10} className="me-3" style={{width: 70}}  />
                            <span style={{color: '#0073CF', fontWeight: 700}}>Diabetes Direct</span>
                        </a>

                        {/* Center - Products Menu*/}
                        <div className="d-none d-lg-flex ms-auto me-auto">
                            <MegaMenu apiBase="http://localhost:8080" onProductClick={(p) => navigate(`/details/${p.id}`)} />
                        </div>

                        {/* Right - Cart and Hamburger */}
                        <div className="d-flex align-items-center gap-3">
                            {/* Right - Cart - Desktop only */}
                            <a className="nav-link d-none d-lg-flex align-items-center" href="/cart" style={{
                                transition: 'all 0.3s ease',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.5rem',
                                whiteSpace: 'nowrap',
                                textDecoration: 'none',
                                color: '#333',
                                margin: 0,
                                fontSize: '2rem',
                                fontWeight: 500,
                                letterSpacing: '0.3px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0073CF';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#333';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            >
                                <i className="bi bi-cart4 me-2"/>Cart
                            </a>

                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" style={{border: 'none', fontSize: '1.5rem'}}>
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Mobile menu */}
                    <div id="navbarNav" className="collapse navbar-collapse px-4">

                        {/* Mobile Cart Link */}
                        <a className="nav-link d-lg-none" href="/cart" style={{fontSize: '1.1rem', fontWeight: 500, paddingTop: '0.75rem', paddingBottom: '0.75rem'}}>
                            <i className="bi bi-cart4 me-2"/>Cart
                        </a>
                    </div>
                </nav>
            </header>

            <main className="container-fluid flex-grow-1">
                <Outlet />
            </main>

            {/*Footer section*/}
            <footer className="bg-dark text-white py-3">
                <div className="container-fluid px-4">
                    <div className="row align-items-center">
                        <div className="col-md-6 small">
                            <p className="mb-1"><strong>Diabetes Direct</strong></p>
                            <p className="text-white mb-0">
                                <i className="bi bi-envelope me-2"></i>
                                <a href="mailto:support@diabetesdirect.ca" className="text-decoration-none text-white">support@diabetesdirect.ca</a>
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end small">
                            <p className="text-white mb-0">&copy; 2026 Diabetes Direct</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}