export interface CartItem {
    id: number;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
}