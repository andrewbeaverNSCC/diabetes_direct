import {useParams, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import type {Product} from "../../types/Product.tsx";
import { getProductImage, getPrice } from "../../types/Product.tsx";
import Cookies from "js-cookie";
import type {Cart, CartItem} from "../../types/Cart.tsx";

export default function Details(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null)
    const [showMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [quantity, setQuantity] = useState<number>(1)
    const COOKIE_KEY = 'diabetes-direct-cart'

    useEffect(() => {
        // If no ID is provided, redirect to 404
        if (!id) {
            navigate('/*');
            return
        }

        // Use AbortController to cancel fetch if component unmounts
        const controller = new AbortController()

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`http://localhost:8080/products/${id}`, { signal: controller.signal })
                if (!res.ok) {
                    if (res.status === 404) {
                        navigate('/*');
                        return;
                    }
                    throw new Error(`Server returned ${res.status}`)
                }
                const data = await res.json()
                setProduct(data)
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return
                const message = err instanceof Error ? err.message : String(err)
                setError(message)
            } finally {
                // stop loading spinner
                setLoading(false)
            }
        }

        fetchData()
        return () => controller.abort()
    }, [id, navigate])

    const handleAddToCart = () => {
        if (!product) return

        const raw = Cookies.get(COOKIE_KEY)
        const cart: Cart = raw ? JSON.parse(raw) : { items: [] }
        const existing = cart.items.find((item: CartItem) => item.id === product.id)

        const updatedItems = existing
            ? cart.items.map((item: CartItem) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
            : [...cart.items, { id: product.id, quantity }]

        Cookies.set(COOKIE_KEY, JSON.stringify({ items: updatedItems }), { expires: 7 })
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 3000)
    }

    return(
        <>
            {
                // Success message for adding to cart
                showMessage && (
                    <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
                        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center shadow-lg" role="alert" style={{ minWidth: '300px' }}>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <div>
                                <strong>Success!</strong> Added to cart.
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>
                )
            }
            <div className="py-4">
                <h1 className="mb-4">Product Details</h1>
                {loading && <p className="text-muted">Loading product details...</p>}
                {error && <div className="alert alert-danger">{error}</div>}

                {/*Display product information*/}
                {product && (
                    <div className="card shadow-sm border-0">
                        <div className="row g-0">
                            {/*Show Image*/}
                            <div className="col-lg-5 d-flex align-items-center justify-content-center p-4" style={{backgroundColor: '#f8f9fa'}}>
                                <img src={getProductImage(product)} className="img-fluid" alt={product.name} style={{maxHeight: '400px', objectFit: 'contain'}}/>
                            </div>
                            <div className="col-lg-7">
                                <div className="card-body p-4">
                                    {/*Show brand and category in separate badges*/}
                                    <div className="mb-3">
                                        {product.category && <span className="badge bg-secondary me-2">{product.category.name}</span>}
                                        {product.brand && <span className="badge bg-light text-dark">{product.brand.name}</span>}
                                    </div>
                                    {/*Show name*/}
                                    <h2 className="card-title mb-2">{product.name}</h2>
                                    {/*Show description*/}
                                    <p className="card-text text-muted mb-4">{product.description}</p>

                                    {/*Show price*/}
                                    <div className="border-top border-bottom py-3 mb-4">
                                        <p className="mb-0"><strong className="fs-4 text-primary">${getPrice(product).toFixed(2)}</strong></p>
                                    </div>
                                    {/*Display if prescription is required*/}
                                    <div className="mb-4">
                                        {product.prescriptionRequired && (
                                            <div className="alert alert-warning py-2 mb-2">
                                                <span className="me-2">⚠️</span>
                                                <strong>Prescription Required</strong>
                                            </div>
                                        )}

                                        {/*Display if the product must be refrigerated */}
                                        {product.refrigerate && (
                                            <div className="alert alert-info py-2">
                                                <span className="me-2">❄️</span>
                                                <strong>Keep Refrigerated</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/*Quantity selector box*/}
                                    <div className="mb-4">
                                        <label htmlFor="quantity" className="form-label fw-semibold">Quantity:</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                style={{width: '40px', height: '40px', padding: '0'}}
                                            >
                                                −
                                            </button>
                                            <input
                                                id="quantity"
                                                type="number"
                                                className="form-control text-center"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setQuantity(Math.max(1, val));
                                                }}
                                                min="1"
                                                style={{width: '60px'}}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setQuantity(quantity + 1)}
                                                style={{width: '40px', height: '40px', padding: '0'}}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/*Add to cart button event*/}
                                    <button className="btn btn-primary btn-lg w-100" onClick={handleAddToCart}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}