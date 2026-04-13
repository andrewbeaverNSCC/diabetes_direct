import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import type {Category} from "../../types/Category.tsx";
import type {Brand} from "../../types/Brands.tsx";
import type {Product} from "../../types/Product.tsx";
import { getProductImage } from "../../types/Product.tsx";

type Group = "categories" | "brands";

interface MegaMenuProps {
    apiBase?: string;
    onProductClick?: (product: Product) => void;
}

export default function MegaMenu({ apiBase = "", onProductClick }: MegaMenuProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen]           = useState(false);
    const [activeGroup, setActiveGroup] = useState<Group>("categories");
    const [activeSub, setActiveSub]     = useState<Category | Brand | null>(null);

    const [categories, setCategories]   = useState<Category[]>([]);
    const [brands, setBrands]           = useState<Brand[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);

    const [products, setProducts]       = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);

    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch on mount
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    fetch(`${apiBase}/categories`),
                    fetch(`${apiBase}/brands`),
                ]);
                if (!catRes.ok || !brandRes.ok) throw new Error("Failed to load menu data");
                const [cats, brnds]: [Category[], Brand[]] = await Promise.all([
                    catRes.json(),
                    brandRes.json(),
                ]);
                setCategories(cats);
                setBrands(brnds);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [apiBase]);

    useEffect(() => {
        setActiveSub(null);
        setProducts([]);
        setProductsError(null);
    }, [activeGroup]);

    // fetch products for the hovered sub (category or brand)
    useEffect(() => {
        if (!activeSub) {
            setProducts([]);
            return;
        }
        const controller = new AbortController();
        const param = activeGroup === "categories" ? "categoryId" : "brandId";
        const url = `${apiBase}/products?${param}=${activeSub.id}`;

        setProductsLoading(true);
        setProductsError(null);

        fetch(url, { signal: controller.signal })
            .then((r) => {
                if (!r.ok) throw new Error("Failed to load products");
                return r.json();
            })
            .then((data: Product[]) => setProducts(data))
            .catch((err) => {
                if (err.name !== "AbortError") setProductsError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => setProductsLoading(false));

        return () => controller.abort();
    }, [activeSub, activeGroup, apiBase]);

    // Handlers for mouse enter/leave with delay to prevent flickering
    const handleMouseEnter = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setIsOpen(true);
    };
// Delay closing the menu to allow moving between columns without flicker
    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => {
            setIsOpen(false);
            setActiveSub(null);
        }, 120);
    };

    const activeList: (Category | Brand)[] =
        activeGroup === "categories" ? categories : brands;

    const colItemStyle = (isActive: boolean): React.CSSProperties => ({
        fontSize: 13,
        fontWeight: 500,
        borderLeft: isActive ? "3px solid #0073CF" : "3px solid transparent",
        borderRadius: 0,
        color: isActive ? "#0073CF" : "#666",
        backgroundColor: isActive ? "#f0f7ff" : "transparent",
        transition: 'all 0.2s ease',
    });

    return (
        <div
            className="position-relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className="btn btn-link nav-link d-flex align-items-center gap-1 text-decoration-none px-0"
                style={{
                    color: isOpen ? "#0073CF" : "#333",
                    fontSize: '2rem',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    transition: 'all 0.3s ease',
                    padding: '0.8rem 1.5rem !important',
                    borderRadius: '0.5rem',
                    border: 'none'
                }}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => navigate('/products')}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0073CF';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isOpen ? '#0073CF' : '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Products
                <span
                    style={{
                        fontSize: 35,
                        display: "inline-block",
                        transition: "transform 0.15s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
          ▾
        </span>
            </button>

            {isOpen && (
                <div
                    className="position-absolute bg-white border rounded-bottom shadow-lg d-flex"
                    style={{ top: "100%", left: 0, minWidth: 520, minHeight: 280, zIndex: 1050, marginTop: '0.5rem', boxShadow: '0 10px 40px rgba(0, 115, 207, 0.15)' }}
                >
                    <div className="border-end py-2" style={{ width: 160, flexShrink: 0, backgroundColor: '#f8fafc' }}>
                        <p className="px-3 mb-2 text-uppercase text-muted fw-bold" style={{ fontSize: 11, letterSpacing: "0.1em", color: '#0073CF' }}>
                            Browse by
                        </p>

                        {(["categories", "brands"] as Group[]).map((group) => (
                            <button
                                key={group}
                                className="btn btn-link w-100 text-start text-decoration-none px-3 py-2 d-flex justify-content-between align-items-center"
                                style={colItemStyle(activeGroup === group)}
                                onMouseEnter={() => setActiveGroup(group)}
                            >
                                {group.charAt(0).toUpperCase() + group.slice(1)}
                                <span style={{ fontSize: 10 }}>▶</span>
                            </button>
                        ))}
                    </div>

                    <div className="border-end py-2" style={{ width: 160, flexShrink: 0, backgroundColor: '#f8fafc' }}>
                        <p className="px-3 mb-2 text-uppercase fw-bold" style={{ fontSize: 11, letterSpacing: "0.1em", color: '#0073CF' }}>
                            {activeGroup === "categories" ? "Categories" : "Brands"}
                        </p>

                        {loading && <p className="px-3 text-muted" style={{ fontSize: 13 }}>Loading…</p>}
                        {error && <p className="px-3 text-danger" style={{ fontSize: 13 }}>{error}</p>}

                        {!loading && !error && activeList.map((item) => (
                            <button
                                key={item.id}
                                className="btn btn-link w-100 text-start text-decoration-none px-3 py-2 d-flex justify-content-between align-items-center"
                                style={colItemStyle(activeSub?.id === item.id)}
                                onMouseEnter={() => setActiveSub(item)}
                                onClick={() => {
                                    const param = activeGroup === 'categories' ? `categoryId=${item.id}` : `brandId=${item.id}`;
                                    navigate(`/products?${param}`);
                                }}
                            >
                                {item.name}
                                <span style={{ fontSize: 10 }}>▶</span>
                            </button>
                        ))}
                    </div>

                    <div className="py-2 flex-grow-1">
                        {!activeSub ? (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{ fontSize: 13, minHeight: 150 }}>
                                Hover a {activeGroup === "categories" ? "category" : "brand"}
                            </div>
                        ) : (
                            <>
                                <p className="px-3 mb-2 text-uppercase fw-bold" style={{ fontSize: 11, letterSpacing: "0.1em", color: '#0073CF' }}>
                                    {activeSub.name}
                                </p>

                                {productsLoading && <p className="px-3 text-muted" style={{ fontSize: 13 }}>Loading products…</p>}
                                {productsError && <p className="px-3 text-danger" style={{ fontSize: 13 }}>{productsError}</p>}

                                {!productsLoading && products.length === 0 && !productsError && (
                                    <p className="px-3 text-muted" style={{ fontSize: 13 }}>No products found.</p>
                                )}

                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        className="btn btn-link w-100 text-start text-decoration-none px-3 py-2 d-flex align-items-center gap-2"
                                        style={{ fontSize: 13, color: "#333", transition: 'all 0.2s ease' }}
                                        onClick={() => onProductClick?.(product)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f0f7ff';
                                            e.currentTarget.style.color = '#0073CF';
                                            e.currentTarget.style.fontWeight = '600';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#333';
                                            e.currentTarget.style.fontWeight = '500';
                                        }}
                                    >
                                        {getProductImage(product) && (
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                style={{ width: 40, height: 40, objectFit: 'contain', backgroundColor: '#f8f9fa', borderRadius: '4px', flexShrink: 0 }}
                                            />
                                        )}
                                        <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{product.name}</div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}