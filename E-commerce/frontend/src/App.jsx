import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home           from './pages/home'
import Login          from './pages/login'
import Register       from './pages/register'
import ForgotPassword from './pages/forgotpassword'
import ResetPassword  from './pages/resetpassword'
import Products       from './pages/products'
import AdminProducts  from './pages/adminProducts'
import Cart           from './pages/cart1'
import Orders         from './pages/orders'
import AdminDashboard from './pages/admindashboard'
import Checkout from './pages/checkout'
import ProductDetail from './pages/ProductDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/products"        element={<Products />} />
        <Route path="/admin/products"  element={<AdminProducts />} />
        <Route path="/cart"            element={<Cart />} />
        <Route path="/orders"          element={<Orders />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App