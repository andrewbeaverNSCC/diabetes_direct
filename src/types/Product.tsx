import type { Brand } from "./Brands";
import type { Category } from "./Category";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number | string; // BigDecimal can serialize as string
    imageURL?: string;
    imageUrl?: string;
    imageFilename?: string;

    createdDate?: string;
    prescriptionRequired?: boolean;
    refrigerate?: boolean;
    reducedWithInsurance?: boolean;

    // Nested relations from backend
    brand?: Brand;
    category?: Category;
}

// Helper to get image URL (backend sends imageURL)
// Azurite URLs will work directly from the browser
export function getProductImage(p: Product): string | undefined {
    const url = p.imageURL || p.imageUrl;

    // Return URL as-is - browser can reach Azurite directly
    // No need to proxy through backend
    return url || (p.imageFilename ? `/images/${p.imageFilename}` : undefined);
}

// Helper to convert price to number
export function getPrice(p: Product): number {
    return typeof p.price === 'number' ? p.price : Number(p.price || 0);
}
