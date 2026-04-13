import { useNavigate } from 'react-router';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="py-5">
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                            <h1 style={{
                                fontSize: '8rem',
                                fontWeight: 700,
                                color: '#0073CF',
                                margin: '0 0 1rem 0',
                                lineHeight: 1
                            }}>
                                404
                            </h1>
                            <h2 className="mb-3" style={{ fontSize: '2rem', fontWeight: 600, color: '#333' }}>
                                Page Not Found
                            </h2>
                            <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                                Sorry! The page you're looking for doesn't exist or may have been moved.
                            </p>
                            {/*Info section*/}
                            <div className="alert alert-info mb-4" style={{ backgroundColor: '#e7f3ff', borderColor: '#0073CF' }}>
                                <i className="bi bi-info-circle me-2" style={{ color: '#0073CF' }}></i>
                                <span style={{ color: '#0073CF' }}>If you think this is a mistake, please contact our support team.</span>
                            </div>
                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                <button
                                    className="btn btn-primary btn-lg fw-bold"
                                    onClick={() => navigate('/')}
                                >
                                    <i className="me-2"></i>
                                    Go to Home
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-lg fw-bold"
                                    onClick={() => navigate('/products')}
                                >
                                    <i className="me-2"></i>
                                    Browse Products
                                </button>
                                {/*Use browser history for going back */}
                                <button
                                    className="btn btn-outline-secondary btn-lg fw-bold"
                                    onClick={() => window.history.back()}
                                >
                                    <i className="me-2"></i>
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
