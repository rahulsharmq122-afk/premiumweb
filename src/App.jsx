import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Settings, Plus, Trash2, Sun, Moon, Menu, X, ArrowUp, Upload } from 'lucide-react'

const USD_TO_INR = 84

const FALLBACK_PRODUCTS = [
    { id: 1, title: "Netflix Premium 4K", price: "12.99", image: "" },
    { id: 2, title: "Spotify Premium 1yr", price: "24.99", image: "" },
    { id: 3, title: "YouTube Premium", price: "3.50", image: "" }
]

const App = () => {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [activeTab, setActiveTab] = useState('shop')
    const [products, setProducts] = useState(FALLBACK_PRODUCTS)
    const [settings, setSettings] = useState({ whatsapp: '6350117452' })
    const [isDarkMode, setIsDarkMode] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        document.documentElement.className = isDarkMode ? 'dark' : 'light'

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(() => setLoading(false), 300)
                    return 100
                }
                return prev + 10
            })
        }, 50)

        const handleScroll = () => setShowScrollTop(window.scrollY > 400)
        window.addEventListener('scroll', handleScroll)

        const fetchData = async () => {
            try {
                const [pRes, sRes] = await Promise.all([
                    fetch('/api/products').catch(() => null),
                    fetch('/api/settings').catch(() => null)
                ])
                if (pRes && pRes.ok) setProducts(await pRes.json())
                if (sRes && sRes.ok) setSettings(await sRes.json())
            } catch (err) {
                console.warn("Using offline fallback data")
            } finally {
                // Ensure loading ends even if fetch fails
                setTimeout(() => setLoading(false), 1000)
            }
        }
        fetchData()

        return () => {
            clearInterval(timer)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [isDarkMode])

    const updateWhatsapp = async (num) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp: num })
            })
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
                alert("WhatsApp Updated Successfully! ✅")
            } else {
                setSettings({ ...settings, whatsapp: num })
                alert("Offline Mode: Number updated locally! ✅")
            }
        } catch (err) {
            setSettings({ ...settings, whatsapp: num })
            alert("Offline Mode: Number updated locally! ✅")
        }
    }

    const deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' })
            setProducts(products.filter(p => p.id !== id))
        } catch (err) {
            setProducts(products.filter(p => p.id !== id))
            alert("Removed locally (Offline) ✅")
        }
    }

    const addProduct = async (p) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            })
            if (res.ok) {
                const newP = await res.json()
                setProducts([...products, newP])
            } else {
                setProducts([...products, { ...p, id: Date.now() }])
                alert("Added locally (Offline) ✅")
            }
        } catch (err) {
            setProducts([...products, { ...p, id: Date.now() }])
            alert("Added locally (Offline) ✅")
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <style>{`
                    .loading-container { position: fixed; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; z-index: 9999; }
                    .loading-box { width: 300px; text-align: center; }
                    .loading-logo { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 20px; letter-spacing: 4px; }
                    .loading-bar-bg { width: 100%; height: 2px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
                    .loading-bar-fill { height: 100%; background: #00ffa3; transition: width 0.3s ease; }
                `}</style>
                <div className="loading-box">
                    <div className="loading-logo">PREMIUM</div>
                    <div className="loading-bar-bg">
                        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        )
    }

    const navItems = [
        { id: 'shop', label: 'Marketplace', icon: ShoppingCart },
        { id: 'admin', label: 'Admin Panel', icon: Settings },
    ]

    return (
        <div className={`app-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
            <Navbar
                activeTab={activeTab} setActiveTab={setActiveTab}
                isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
                setIsSidebarOpen={setIsSidebarOpen} navItems={navItems}
            />

            <Sidebar
                isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
                activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems}
            />

            <main className="main-content">
                {activeTab === 'shop' && <ShopView products={products} whatsapp={settings.whatsapp} />}
                {activeTab === 'admin' && (
                    <AdminView
                        products={products} whatsapp={settings.whatsapp}
                        onUpdateWhatsapp={updateWhatsapp} onAddProduct={addProduct} onDeleteProduct={deleteProduct}
                    />
                )}
            </main>

            {showScrollTop && (
                <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <ArrowUp size={20} />
                </button>
            )}
        </div>
    )
}

const Navbar = ({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, setIsSidebarOpen, navItems }) => (
    <nav className="navbar glass">
        <div className="nav-side nav-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
            </button>
            <div className="nav-desktop-links">
                {navItems.map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} className={`nav-link ${activeTab === item.id ? 'active' : ''}`}>
                        {item.label}
                    </div>
                ))}
            </div>
        </div>

        <div className="logo central-navbar-logo">
            <span className="logo-accent">PREMIUM</span> MARKET
        </div>

        <div className="nav-side nav-right">
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
    </nav>
)

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab, navItems }) => (
    <>
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}
        </AnimatePresence>
        <motion.div initial={{ x: '-100%' }} animate={{ x: isOpen ? 0 : '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="sidebar glass">
            <div className="sidebar-header">
                <div className="logo">PREMIUM</div>
                <button className="close-btn" onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <div className="sidebar-content">
                {navItems.map(item => (
                    <div key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}>
                        <item.icon size={22} className="sidebar-icon" /> <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    </>
)

const ShopView = ({ products, whatsapp }) => (
    <div className="view-container">
        <div className="hero center-heading">
            <h1>Elite Logistics</h1>
            <p>Digital Excellence and Instant Support ✨</p>
        </div>
        <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} {...p} whatsapp={whatsapp} />)}
        </div>
    </div>
)

const ProductCard = ({ title, price, image, whatsapp }) => {
    const usd = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0
    const inr = (usd * USD_TO_INR).toLocaleString('en-IN')

    const handleBuy = () => {
        const msg = `[ORDER] Hello! I want to buy: ${title}\n\nPrice: $${usd.toFixed(2)} / INR ${inr}\n\nI would like to know further details about this product.`
        window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    return (
        <div className="product-card glass">
            <div className="card-img-container">
                {image ? <img src={image} alt="" /> : <ShoppingCart size={40} className="muted" />}
            </div>
            <div className="card-info centered">
                <h3>{title}</h3>
                <div className="price-box">
                    <span className="usd-main">${usd.toFixed(2)}</span>
                    <span className="inr-sub">₹{inr}</span>
                </div>
                <button onClick={handleBuy} className="buy-btn-centered-pro">
                    <ShoppingCart size={16} /> Buy Now
                </button>
            </div>
        </div>
    )
}

const AdminView = ({ products, whatsapp, onUpdateWhatsapp, onAddProduct, onDeleteProduct }) => {
    const [newWa, setNewWa] = useState(whatsapp)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newItem, setNewItem] = useState({ title: '', price: '', image: '' })

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (file) {
            const r = new FileReader(); r.onloadend = () => setNewItem({ ...newItem, image: r.result }); r.readAsDataURL(file)
        }
    }

    return (
        <div className="view-container">
            <div className="admin-header">
                <h2 className="title-grad">Inventory Control</h2>
                <button className="admin-add-toggle" onClick={() => setIsAddOpen(!isAddOpen)}>
                    {isAddOpen ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {isAddOpen && (
                <div className="admin-form glass">
                    <div className="f-row">
                        <input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Title" />
                        <input value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price (USD)" />
                    </div>
                    <div className="f-row">
                        <label className="f-upload glass">
                            <Upload size={16} /> {newItem.image ? 'Image Loaded' : 'Upload From Device'}
                            <input type="file" onChange={handleFile} hidden />
                        </label>
                        {newItem.image && <img src={newItem.image} className="f-preview" />}
                    </div>
                    <button className="f-submit" onClick={() => { onAddProduct(newItem); setIsAddOpen(false); setNewItem({ title: '', price: '', image: '' }); }}>Confirm & Add</button>
                </div>
            )}

            <div className="admin-table-container glass">
                <table className="pro-table pc-only">
                    <thead>
                        <tr><th>Image</th><th>Identity</th><th>Cost (USD / INR)</th><th>Ops</th></tr>
                    </thead>
                    <tbody>
                        {products.map(p => {
                            const usd = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0
                            const inr = (usd * USD_TO_INR).toLocaleString('en-IN')
                            return (
                                <tr key={p.id}>
                                    <td><div className="t-thumb">{p.image && <img src={p.image} />}</div></td>
                                    <td className="t-bold">{p.title}</td>
                                    <td>
                                        <div className="t-price-cell">
                                            <span className="t-usd">${usd.toFixed(2)}</span>
                                            <span className="t-sep">/</span>
                                            <span className="t-inr">₹{inr}</span>
                                        </div>
                                    </td>
                                    <td><button className="t-del" onClick={() => onDeleteProduct(p.id)}><Trash2 size={16} /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className="mobile-admin-grid mobile-only">
                    {products.map(p => {
                        const usd = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0
                        const inr = (usd * USD_TO_INR).toLocaleString('en-IN')
                        return (
                            <div key={p.id} className="admin-p-card glass">
                                <div className="ap-left">
                                    <div className="t-thumb">{p.image && <img src={p.image} />}</div>
                                    <div className="ap-txt">
                                        <div className="t-bold">{p.title}</div>
                                        <div className="t-price-cell">
                                            <span className="t-usd">${usd.toFixed(2)}</span>
                                            <span className="t-sep">/</span>
                                            <span className="t-inr">₹{inr}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="t-del" onClick={() => onDeleteProduct(p.id)}><Trash2 size={16} /></button>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="admin-settings-pro glass">
                <h3>Global Concierge</h3>
                <div className="s-field">
                    <label>WhatsApp Integration Number</label>
                    <div className="s-input-group">
                        <input value={newWa} onChange={e => setNewWa(e.target.value)} placeholder="e.g. 1234567890" />
                        <button onClick={() => onUpdateWhatsapp(newWa)}>Update Node</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
