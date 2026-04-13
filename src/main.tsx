import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Home from "./components/pages/Home.tsx";
import Cart from "./components/pages/Cart.tsx";
import Checkout from "./components/pages/Checkout.tsx";
import Confirmation from "./components/pages/Confirmation.tsx";
import Layout from "./components/pages/Layout.tsx";
import Details from "./components/pages/Details.tsx";
import Products from "./components/pages/Products.tsx";
import NotFound from "./components/pages/NotFound.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
              <Route path="/details/:id" element={<Details />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="*" element={<NotFound />} />
              </Route>
          </Routes>
      </BrowserRouter>
  </StrictMode>
)
