import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { Product } from "../../types/Product.tsx";
import { getProductImage, getPrice } from "../../types/Product.tsx";
import ChatWidget from "../layout/ChatWidget.tsx";
import logo from '../../assets/DiabetesDirect.png';
import diabetesCanadaLogo from '../../assets/Diabetes_Canada_logo.svg';
import mealWaveIcon from '../../assets/MealWave_icon.png';

export default function Home(){
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Fetch products on mount
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://localhost:8080/products', { signal: controller.signal });
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, []);

    // Rotate carousel every 4 seconds
    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            // Move to next index with wrapping
            setCurrentIndex((prev) => (prev + 1) % products.length);

            // Reset transition state after animation completes
            setTimeout(() => {
                setIsTransitioning(false);
            }, 800);
        }, 4000);

        return () => clearInterval(interval);
    }, [products.length]);

    // Get the 3 products to display
    const getDisplayedProducts = () => {
        if (products.length === 0) return [];
        return [
            products[currentIndex],
            products[(currentIndex + 1) % products.length],
            products[(currentIndex + 2) % products.length]
        ];
    };

    return(
        <>
            {/* Hero Section */}
            <section className="hero-section py-5" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e1f5 8%, #c3c5ec 17%, #9faae4 25%, #7591db 33%, #5c83d2 42%, #3f75ca 50%, #0268c1 58%, #0360b7 67%, #0259ad 75%, #0151a3 83%, #004a99 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container py-5">
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
                        <img src={logo} alt="Diabetes Direct logo" style={{height: '150px', width: 'auto'}} />
                    </div>
                    <h1 className="display-4 fw-bold mb-4">Diabetes Direct</h1>
                    <p className="lead fs-5 mb-4" style={{maxWidth: '600px', margin: '0 auto'}}>
                        No more trips to the pharmacy, we're making Diabetes supplies accessible wherever you are
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button
                            className="btn btn-light btn-lg fw-bold"
                            onClick={() => navigate('/products')}
                        >
                            Shop Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <h2 className="text-center mb-5 fw-bold" style={{ color: '#333' }}>Featured Products</h2>

                    {/*Handle fails*/}
                    {error && (
                        <div className="alert alert-danger text-center mb-4">
                            Failed to load products: {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="alert alert-info text-center">
                            No products available at the moment.
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-3 g-4" style={{
                            transition: 'opacity 0.5s ease-in-out',
                            opacity: isTransitioning ? 0.7 : 1
                        }}>
                            {/*Carousel through products and transform on hover*/}
                            {getDisplayedProducts().map((product) => (
                                <div key={`${product.id}-${currentIndex}`} className="col carousel-product-card">
                                    <div className="card h-100 shadow-sm" style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        border: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onClick={() => navigate(`/details/${product.id}`)}
                                    >
                                        <div style={{
                                            height: '200px',
                                            overflow: 'hidden',
                                            backgroundColor: '#e9ecef',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {/*Get product image, Name and description*/}
                                            {getProductImage(product) ? (
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: '#999' }}>No Image</span>
                                            )}
                                        </div>
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{product.name}</h5>
                                            <p className="card-text text-muted flex-grow-1">
                                                {product.description}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="h5 mb-0" style={{ color: '#0073CF' }}>
                                                    ${getPrice(product).toFixed(2)}
                                                </span>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/details/${product.id}`);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}



                </div>
            </section>

            {/* Learn about Diabetes Management Section */}
            <section className="learn-diabetes py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Learn about Diabetes Management</h2>
                            <p className="lead text-muted mb-4">
                                Understanding diabetes is the first step to managing it effectively. Learn more about what diabetes is, how to manage it, and resources available to help you live a healthier life.
                            </p>
                            <a
                                href="https://www.diabetes.ca/about-diabetes/what-is-diabetes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                            >
                                Learn More from Diabetes Canada
                            </a>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm" style={{
                                background: 'linear-gradient(135deg, #0073CF 0%, #004a99 100%)',
                                color: 'white'
                            }}>
                                <div className="card-body p-5 text-center d-flex flex-column align-items-center justify-content-center">
                                    <img src={diabetesCanadaLogo} alt="Diabetes Canada logo" style={{height: '80px', marginBottom: '1.5rem', filter: 'brightness(0) invert(1)', display: 'block'}} />
                                    <h4 className="card-title mb-3">Taking Control of Your Health</h4>
                                    <p className="card-text">
                                        With proper management, education, and support, you can live a full and healthy life with diabetes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MealWave App Section */}
            <section className="mealwave-section py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0 d-flex justify-content-center">
                            <a
                                href="https://github.com/andbeaver/MealWave"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <img src={mealWaveIcon} alt="MealWave app icon" style={{height: '300px', width: 'auto', cursor: 'pointer', transition: 'transform 0.3s'}}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </a>
                        </div>
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Simplify Your Insulin Calculations</h2>
                            <p className="lead text-muted mb-4">
                                Introducing <strong>MealWave</strong> - a mobile app that uses the Warsaw formula to calculate insulin doses for meals with carbohydrates, fat, and protein. Designed to help you better match insulin to real-world meals and reduce delayed glucose spikes.
                            </p>
                            <a
                                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5375087/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                            >
                                Learn More About the Warsaw Formula
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <ChatWidget />
        </>
    )
}