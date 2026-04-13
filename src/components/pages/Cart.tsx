import {Link} from "react-router";
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import type {Cart, CartItem} from "../../types/Cart.tsx";
import type {Product} from "../../types/Product.tsx";
import {getPrice, getProductImage} from "../../types/Product.tsx";

export default function Cart(){
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Map<number, Product>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const COOKIE_KEY = 'diabetes-direct-cart';

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get cart from cookie
                const raw = Cookies.get(COOKIE_KEY);
                const cartData: Cart = raw ? JSON.parse(raw) : { items: [] };
                setCart(cartData.items);

                // Fetch product details for each item
                const productMap = new Map<number, Product>();
                for (const item of cartData.items) {
                    try {
                        const res = await fetch(`http://localhost:8080/products/${item.id}`);
                        if (res.ok) {
                            const product = await res.json();
                            productMap.set(item.id, product);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch product ${item.id}:`, err);
                    }
                }
                setProducts(productMap);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, []);

    const removeFromCart = (productId: number) => {
        const updatedItems = cart.filter(item => item.id !== productId);
        setCart(updatedItems);
        Cookies.set(COOKIE_KEY, JSON.stringify({ items: updatedItems }), { expires: 7 });
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const updatedItems = cart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedItems);
        Cookies.set(COOKIE_KEY, JSON.stringify({ items: updatedItems }), { expires: 7 });
    };

    const calculateTotal = (): number => {
        return cart.reduce((sum, item) => {
            const product = products.get(item.id);
            const price = product ? getPrice(product) : 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const isEmpty = cart.length === 0;

    return(
        <>
            {/*Shopping Cart panel*/}
            <div className="container py-4">
                <h1 className="mb-4">Shopping Cart</h1>

                {loading && <p>Loading cart...</p>}
                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && isEmpty && (
                    <div className="alert alert-info" role="alert">
                        Your cart is empty
                    </div>
                )}

                {!loading && !isEmpty && (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => {
                                            const product = products.get(item.id);
                                            const price = product ? getPrice(product) : 0;
                                            const itemTotal = price * item.quantity;

                                            return (
                                                <tr key={item.id}>
                                                    {/*Product name and image*/}
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            {product?.imageURL && (
                                                                <img src={getProductImage(product)} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                                                            )}
                                                            <div>
                                                                <div className="fw-bold">{product?.name || `Product #${item.id}`}</div>
                                                                {product?.brand && <small className="text-muted">{product.brand.name}</small>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/*Price*/}
                                                    <td>${price.toFixed(2)}</td>
                                                    {/*Update quantity box*/}
                                                    <td>
                                                        <div className="input-group" style={{width: '120px'}}>
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                            <input type="number" className="form-control text-center" value={item.quantity} onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))} />
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold">${itemTotal.toFixed(2)}</td>
                                                    {/*Remove item button*/}
                                                    <td>
                                                        <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Order Summary*/}
                        <div className="col-lg-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Order Summary</h5>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Items:</span>
                                        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-3">
                                        <strong>Total:</strong>
                                        <strong>${calculateTotal().toFixed(2)}</strong>
                                    </div>
                                    <Link to="/checkout" className="btn btn-primary w-100 mb-2">Proceed to Checkout</Link>
                                    <Link to="/" className="btn btn-outline-secondary w-100">Continue Shopping</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && isEmpty && (
                    <div className="mt-4">
                        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
                    </div>
                )}
            </div>
        </>
    )
}