import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'

import Home from "./components/pages/Home.tsx";
import Cart from "./components/pages/Cart.tsx";
import Checkout from "./components/pages/Checkout.tsx";
import Confirmation from "./components/pages/Confirmation.tsx";



createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
