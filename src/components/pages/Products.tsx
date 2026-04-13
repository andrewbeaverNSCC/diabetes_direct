import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router';
import type { Product } from "../../types/Product.tsx";
import { getProductImage, getPrice } from "../../types/Product.tsx";
import type { Filters } from "../../types/Filters.tsx";
import { FilterSection } from "../layout/FilterSection.tsx";
import type {Category} from "../../types/Category.tsx";
import type {Brand} from "../../types/Brands.tsx";
import Cookies from "js-cookie";
import type { Cart, CartItem } from "../../types/Cart.tsx";

export default function Products() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        categoryIds: new Set(),
        brandIds: new Set(),
    });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [addedProductId, setAddedProductId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'name-asc' | 'price-asc' | 'price-desc' | 'none'>('none');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const COOKIE_KEY = 'diabetes-direct-cart';

    // Apply URL query params to filters on mount
    useEffect(() => {
        const categoryId = searchParams.get('categoryId');
        const brandId = searchParams.get('brandId');

        const newFilters: Filters = {
            categoryIds: new Set(),
            brandIds: new Set(),
        };

        if (categoryId) newFilters.categoryIds.add(Number(categoryId));
        if (brandId) newFilters.brandIds.add(Number(brandId));

        setFilters(newFilters);
    }, [searchParams]);

    useEffect(() => {
        // Use AbortController to cancel fetch if component unmounts    
        const controller = new AbortController()
        
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch('http://localhost:8080/products', { signal: controller.signal })
                if (!res.ok) throw new Error(`Server returned ${res.status}`)
                const data = await res.json()
                setProducts(data)
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return
                const message = err instanceof Error ? err.message : String(err)
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        return () => controller.abort()
    }, [])

    const filteredProducts = useMemo(() => {
        const result = products.filter((p) => {
            // Filter by selected categories and brands
            const categoryMatch = filters.categoryIds.size === 0 || (p.category?.id && filters.categoryIds.has(p.category.id));
            const brandMatch = filters.brandIds.size === 0 || (p.brand?.id && filters.brandIds.has(p.brand.id));

            // Search filtering
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = searchQuery === '' ||
                p.name.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower) ||
                p.brand?.name.toLowerCase().includes(searchLower) ||
                p.category?.name.toLowerCase().includes(searchLower);

            return categoryMatch && brandMatch && searchMatch;
        });

        // Apply sorting
        if (sortBy === 'price-asc') {
            result.sort((a, b) => getPrice(a) - getPrice(b));
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => getPrice(b) - getPrice(a));
        } else if (sortBy === 'name-asc') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [products, filters, searchQuery, sortBy]);

    // Extract unique categories and brands from products for filter options
    const categories = useMemo(
        () => Array.from(new Map<number, Category>(
            products
                .filter(p => p.category?.id)
                .map(p => [p.category!.id, p.category!] as const)
        ).values()),
        [products]
    );

    // Use Map to ensure uniqueness while preserving order of first occurrence
    const brands = useMemo(
        () => Array.from(new Map<number, Brand>(
            products
                .filter(p => p.brand?.id)
                .map(p => [p.brand!.id, p.brand!] as const)
        ).values()),
        [products]
    );

    // Handle filter checkbox changes
    const handleFilterChange = (group: 'categoryIds' | 'brandIds', id: number, checked: boolean) => {
        setFilters((prev) => {
            const next = new Set(prev[group]);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return { ...prev, [group]: next };
        });
    };

    // Clear all filters and search
    const clearFilters = () => {
        setFilters({ categoryIds: new Set(), brandIds: new Set() });
        setSearchQuery('');
        setSortBy('none');
    };

    // Add product to cart stored in cookies
    const handleAddToCart = (product: Product) => {
        const raw = Cookies.get(COOKIE_KEY);
        const cart: Cart = raw ? JSON.parse(raw) : { items: [] };
        const existing = cart.items.find((item: CartItem) => item.id === product.id);
        // 1 added per click
        const quantity = 1;

        // If product already in cart, increment quantity. Otherwise, add new item.
        const updatedItems = existing
            ? cart.items.map((item: CartItem) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
            : [...cart.items, { id: product.id, quantity }];

        Cookies.set(COOKIE_KEY, JSON.stringify({ items: updatedItems }), { expires: 7 });
        setAddedProductId(product.id);
        setSuccessMessage(`${product.name} added to cart!`);
        setShowSuccessMessage(true);
        setTimeout(() => setAddedProductId(null), 2000);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    // Determine if any filters or search query are active for UI feedback
    const hasActiveFilters = filters.categoryIds.size > 0 || filters.brandIds.size > 0 || searchQuery !== '';

    // Render loading, error, and main content
    if (loading) return <div className="p-4"><p>Loading products...</p></div>;
    if (error) return <div className="p-4"><div className="alert alert-danger">{error}</div></div>;


    return (
        <div className="container-fluid py-4">
            {showSuccessMessage && (
                <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
                    <div className="alert alert-success alert-dismissible fade show d-flex align-items-center shadow-lg" role="alert" style={{ minWidth: '300px' }}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {/*Display success message when adding item to cart*/}
                        <div>
                            <strong>Success!</strong> {successMessage}
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setShowSuccessMessage(false)}></button>
                    </div>
                </div>
            )}
            <div className="row">
                {/*Side bar*/}
                <aside className="col-12 col-md-3 col-lg-2 mb-4 mb-md-0">
                    <div className="mb-4">
                        {/*Search box*/}
                        <div className="input-group">
                            <span className="input-group-text bg-white border" style={{borderColor: '#dee2e6'}}>
                                {/*Magnifying  glass*/}
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border"
                                placeholder="Search products"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{borderColor: '#dee2e6'}}
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{borderColor: '#dee2e6'}}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Filter section*/}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="mb-0">Filter</h5>
                        {hasActiveFilters && (
                            <button className="btn btn-link btn-sm p-0 text-muted text-decoration-none" onClick={clearFilters} style={{ fontSize: 13 }}>
                                Clear all
                            </button>
                        )}
                    </div>

                    <FilterSection title="Category" items={categories} selected={filters.categoryIds} onChange={(id, checked) => handleFilterChange('categoryIds', id, checked)} />
                    <FilterSection title="Brand" items={brands} selected={filters.brandIds} onChange={(id, checked) => handleFilterChange('brandIds', id, checked)} />
                </aside>

                {/*Main content*/}
                <main className="col-12 col-md-9 col-lg-10">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} {hasActiveFilters ? 'matching filters' : ''}
                        </p>
                        {/*Sorting dropdown*/}
                        <div style={{minWidth: '150px'}}>
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                style={{fontSize: '14px'}}
                            >
                                <option value="none">Sort by</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                            </select>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <p className="mb-2">No products match your filters.</p>
                            <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        // Grid to display products, responsive with 1 column on xs, 2 on sm, and 3 on xl and above
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                            {filteredProducts.map((product) => (
                                <div className="col" key={product.id}>
                                    <Link to={`/details/${product.id}`} className="text-decoration-none">
                                        <div className="card h-100 shadow-sm">
                                            {/*Show image, make it a link*/}
                                            {getProductImage(product) && (
                                                <img src={getProductImage(product)} className="card-img-top" alt={product.name} style={{ height: 200, objectFit: 'contain', backgroundColor: '#f8f9fa', padding: '12px' }} />
                                            )}
                                            <div className="card-body d-flex flex-column">
                                                {/*Show category and Brand in separate badges*/}
                                                <div className="d-flex gap-2 mb-2">
                                                    <span className="badge bg-success-subtle text-success-emphasis" style={{ fontSize: 11 }}>
                                                        {product.category?.name}
                                                    </span>
                                                    <span className="badge bg-secondary-subtle text-secondary-emphasis" style={{ fontSize: 11 }}>
                                                        {product.brand?.name}
                                                    </span>
                                                </div>
                                                {/*Show product name and description*/}
                                                <h6 className="card-title mb-1">{product.name}</h6>
                                                {product.description && (
                                                    <p className="card-text text-muted mb-2" style={{ fontSize: 13 }}>
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="mt-auto d-flex align-items-center justify-content-between">
                                                    {/*Show price*/}
                                                    <span className="fw-semibold">${getPrice(product).toFixed(2)}</span>
                                                    {/*Button to add to cart*/}
                                                    <button
                                                        className={`btn btn-sm ${addedProductId === product.id ? 'btn-success' : 'btn-outline-success'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(product);
                                                        }}
                                                    >
                                                        {addedProductId === product.id ? '✓ Added' : 'Add to cart'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}