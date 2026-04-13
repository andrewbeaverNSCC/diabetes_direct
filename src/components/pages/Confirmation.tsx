import {useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router";

export default function Confirmation(){

    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('session_id');

        fetch(`http://localhost:8080/checkout/session-status?session_id=${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
                setStatus(data.status);
                setCustomerEmail(data.customer_email);
            });
    }, []);

    // Redirect to checkout page if session is still open
    if (status === 'open') {
        return (
            <Navigate to="/checkout" />
        )
    }

    // Show confirmation if complete
    if (status === 'complete') {
        return (
            <section id="success" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '2rem 0' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="card border-0 shadow-lg">
                                <div className="card-body p-5 text-center">
                                    <h1 className="fw-bold mb-3" style={{ color: '#333', fontSize: '2rem' }}>Order Confirmed!</h1>
                                    <p className="lead text-muted mb-4">
                                        Thank you for your purchase. Your order has been successfully completed.
                                    </p>

                                    {/* Order Details Box */}
                                    <div style={{
                                        backgroundColor: '#f0f7ff',
                                        border: '1px solid #0073CF',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        <p className="mb-2" style={{ color: '#666', fontSize: '0.9rem' }}>CONFIRMATION SENT TO</p>
                                        <p style={{
                                            color: '#0073CF',
                                            fontWeight: '600',
                                            fontSize: '1.1rem',
                                            marginBottom: 0
                                        }}>
                                            {customerEmail}
                                        </p>
                                    </div>

                                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                                        A detailed confirmation email with your order details and tracking information will be sent shortly.
                                    </p>



                                    {/* Action Buttons */}
                                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                                        <button
                                            className="btn btn-primary btn-lg fw-bold"
                                            onClick={() => navigate('/products')}
                                            style={{ backgroundColor: '#0073CF', border: 'none' }}
                                        >
                                            Continue Shopping
                                        </button>
                                        <button
                                            className="btn btn-outline-primary btn-lg fw-bold"
                                            onClick={() => navigate('/')}
                                            style={{ borderColor: '#0073CF', color: '#0073CF' }}
                                        >
                                            Back to Home
                                        </button>
                                    </div>

                                    {/* Support Info */}
                                    <hr className="my-4" style={{ borderColor: '#e0e0e0' }} />
                                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 0 }}>
                                        Questions? Contact us at <a href="mailto:orders@example.com" style={{ color: '#0073CF', textDecoration: 'none' }}>orders@example.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return null;
}