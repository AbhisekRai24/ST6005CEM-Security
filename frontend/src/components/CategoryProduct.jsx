

// // src/components/CategoryProducts.jsx
// import React, { useState, useEffect, useContext } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { ShoppingCart, Plus } from "lucide-react"
// import { getBackendImageUrl } from '../utils/backend-image'
// import { useProductsByCategory } from '../hooks/admin/useAdminProduct'
// import { useGetOneCategory } from '../hooks/admin/useAdminCategory'
// import { useCreateOrder } from "../hooks/useCreateOrder"
// import { AuthContext } from "../auth/AuthProvider"
// import { toast } from "react-toastify"
// import UserSidebar from "./UserSideBar"
// import AddToCartPopup from "./AddToCartPopup"
// import ProductDetailsModal from "./ProductDetailsModal"  // import your modal
// import OrderTypeModal from "./OrderType"

// export default function CategoryProducts() {
//   const { categoryId } = useParams()
//   const navigate = useNavigate()
//   const { user } = useContext(AuthContext)

//   // Fetch products under category
//   const { data: products = [], isLoading: productsLoading, isError: productsError } = useProductsByCategory(categoryId)
//   const { category, isLoading: categoryLoading, isError: categoryError } = useGetOneCategory(categoryId)

//   const [cart, setCart] = useState([])
//   const [isCartOpen, setIsCartOpen] = useState(false)
//   const [popupProduct, setPopupProduct] = useState(null)
//   const [popupQuantity, setPopupQuantity] = useState(0)
//   const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false)
//   const [selectedOrderType, setSelectedOrderType] = useState(null)
//   const [selectedProduct, setSelectedProduct] = useState(null);


//   // Load saved cart
//   useEffect(() => {
//     const storedCart = localStorage.getItem("cart")
//     if (storedCart) {
//       setCart(JSON.parse(storedCart))
//     }
//   }, [])

//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart))
//   }, [cart])

//   const handleAddToCart = (productWithAddons) => {
//     setCart((prev) => {
//       const existingIndex = prev.findIndex((item) => {
//         if (item._id !== productWithAddons._id) return false;

//         const a1 = item.addons || [];
//         const a2 = productWithAddons.addons || [];
//         if (a1.length !== a2.length) return false;
//         for (let i = 0; i < a1.length; i++) {
//           if (
//             a1[i].name !== a2[i].name ||
//             Number(a1[i].price) !== Number(a2[i].price) ||
//             Number(a1[i].quantity) !== Number(a2[i].quantity)
//           )
//             return false;
//         }
//         return true;
//       });

//       if (existingIndex >= 0) {
//         const updated = [...prev];
//         updated[existingIndex].quantity += productWithAddons.quantity;
//         return updated;
//       }

//       return [...prev, productWithAddons];
//     });
//   };


//   const removeFromCart = (productId) => {
//     setCart((prev) => prev.filter((p) => p._id !== productId))
//   }

//   const updateQuantity = (id, newQty) => {
//     if (newQty < 1) return
//     setCart((prev) =>
//       prev.map((item) =>
//         item._id === id ? { ...item, quantity: newQty } : item
//       )
//     )
//   }

//   const clearCart = () => {
//     setCart([])
//   }

//   const closePopup = () => {
//     setPopupProduct(null)
//     setPopupQuantity(0)
//   }

//   const incrementPopupQty = () => {
//     updateQuantity(popupProduct._id, popupQuantity + 1)
//     setPopupQuantity((q) => q + 1)
//   }

//   const decrementPopupQty = () => {
//     if (popupQuantity > 1) {
//       updateQuantity(popupProduct._id, popupQuantity - 1)
//       setPopupQuantity((q) => q - 1)
//     }
//   }

//   const createOrderMutation = useCreateOrder(() => {
//     localStorage.removeItem("cart");
//     setCart([]);
//     setIsCartOpen(false);
//     navigate("/normal/myorders");
//   });

//   const handleCheckout = () => {
//     if (cart.length === 0) return;
//     setIsOrderTypeModalOpen(true);
//   };

//   const handleOrderTypeSelect = (type) => {
//     setSelectedOrderType(type);
//     setIsOrderTypeModalOpen(false);

//     const order = {
//       userId: user._id,
//       products: cart,
//       total: cart.reduce((sum, p) => sum + p.price * p.quantity, 0),
//       orderType: type,
//     };

//     createOrderMutation.mutate(order);
//   };

//   // Loading or error UI
//   if (productsLoading || categoryLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   if (productsError || categoryError) {
//     return <p className="text-center text-red-500">Failed to load products or category.</p>
//   }

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-center">{category?.name || 'Category'}</h1>
//         <button
//           onClick={() => setIsCartOpen(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//         >
//           <ShoppingCart className="w-4 h-4" />
//           Cart ({cart.length})
//         </button>
//       </div>

//       {products.length === 0 ? (
//         <p className="text-center text-gray-500">No products found in this category.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(product => (
//             <div key={product._id}
//               className="
//     p-4 shadow rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 flex flex-col
//     transition-transform transition-shadow duration-300 ease-in-out
//     hover:scale-[1.03] hover:shadow-2xl hover:z-10
//     hover:bg-gray-50 dark:hover:bg-gray-700
//     cursor-pointer
//   "
//             >
//               {product.productImage && (
//                 <img
//                   src={getBackendImageUrl(product.productImage)}
//                   alt={product.name}
//                   className="w-full h-48 object-cover rounded mb-3"
//                 />
//               )}
//               <h2 className="text-lg font-semibold">{product.name}</h2>
//               <p className="text-gray-600">Price: Rs {product.price}</p>
//               <p className="text-sm text-gray-500 mb-4">{product.description}</p>
//               <button
//                 onClick={() => {
//                   console.log("Opening modal for:", product);
//                   setSelectedProduct(product);
//                 }}
//                 className="mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 Add to Cart
//               </button>

//             </div>
//           ))}
//         </div>
//       )}

//       {/* Sidebar cart */}
//       <UserSidebar
//         cart={cart}
//         isOpen={isCartOpen}
//         onClose={() => setIsCartOpen(false)}
//         removeFromCart={removeFromCart}
//         updateQuantity={updateQuantity}
//         clearCart={clearCart}
//         onCheckout={handleCheckout}
//       />

//       {selectedProduct && (
//         <ProductDetailsModal
//           product={selectedProduct}
//           onClose={() => setSelectedProduct(null)}
//           onAddToCart={(productWithAddons) => {
//             console.log("Adding from modal:", productWithAddons);
//             handleAddToCart(productWithAddons);
//             setSelectedProduct(null);
//           }}
//         />
//       )}



//       {/* Order type modal */}
//       <OrderTypeModal
//         isOpen={isOrderTypeModalOpen}
//         onClose={() => setIsOrderTypeModalOpen(false)}
//         onSelect={handleOrderTypeSelect}
//       />
//     </div>
//   )
// }




// src/components/CategoryProducts.jsx
import React, { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShoppingCart, Plus, ArrowLeft, Package } from "lucide-react"
import { getBackendImageUrl } from '../utils/backend-image'
import { useProductsByCategory } from '../hooks/admin/useAdminProduct'
import { useGetOneCategory } from '../hooks/admin/useAdminCategory'
import { useCreateOrder } from "../hooks/useCreateOrder"
import { AuthContext } from "../auth/AuthProvider"
import { toast } from "react-toastify"
import UserSidebar from "./UserCartCheckout"
import AddToCartPopup from "./AddToCartPopup"
import ProductDetailsModal from "./ProductDetailsModal"
import OrderTypeModal from "./OrderType"

export default function CategoryProducts() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProductsByCategory(categoryId)
  const { category, isLoading: categoryLoading, isError: categoryError } = useGetOneCategory(categoryId)

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [popupProduct, setPopupProduct] = useState(null)
  const [popupQuantity, setPopupQuantity] = useState(0)
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false)
  const [selectedOrderType, setSelectedOrderType] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const handleAddToCart = (productWithAddons) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        if (item._id !== productWithAddons._id) return false;

        const a1 = item.addons || [];
        const a2 = productWithAddons.addons || [];
        if (a1.length !== a2.length) return false;
        for (let i = 0; i < a1.length; i++) {
          if (
            a1[i].name !== a2[i].name ||
            Number(a1[i].price) !== Number(a2[i].price) ||
            Number(a1[i].quantity) !== Number(a2[i].quantity)
          )
            return false;
        }
        return true;
      });

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += productWithAddons.quantity;
        return updated;
      }

      return [...prev, productWithAddons];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p._id !== productId))
  }

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const closePopup = () => {
    setPopupProduct(null)
    setPopupQuantity(0)
  }

  const incrementPopupQty = () => {
    updateQuantity(popupProduct._id, popupQuantity + 1)
    setPopupQuantity((q) => q + 1)
  }

  const decrementPopupQty = () => {
    if (popupQuantity > 1) {
      updateQuantity(popupProduct._id, popupQuantity - 1)
      setPopupQuantity((q) => q - 1)
    }
  }

  const createOrderMutation = useCreateOrder(() => {
    localStorage.removeItem("cart");
    setCart([]);
    setIsCartOpen(false);
    navigate("/normal/myorders");
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsOrderTypeModalOpen(true);
  };

  const handleOrderTypeSelect = (type) => {
    setSelectedOrderType(type);
    setIsOrderTypeModalOpen(false);

    const order = {
      userId: user._id,
      products: cart,
      total: cart.reduce((sum, p) => sum + p.price * p.quantity, 0),
      orderType: type,
    };

    createOrderMutation.mutate(order);
  };

  if (productsLoading || categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  if (productsError || categoryError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex justify-center items-center">
        <p className="text-center text-red-500">Failed to load products or category.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 py-6">

        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {category?.name || 'Category'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {products.length} {products.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">View Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product._id}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-800 min-h-[420px] flex flex-col"
              >
                {/* Image section */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                  {product.productImage && (
                    <img
                      src={getBackendImageUrl(product.productImage)}
                      alt={product.name}
                      className="w-full h-60 object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  )}

                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    Rs {product.price.toLocaleString()}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content section */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Add to cart button */}
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                    }}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E5BA41] to-amber-500 hover:from-amber-500 hover:to-[#E5BA41] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Sidebar cart */}
      <UserSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        onCheckout={handleCheckout}
      />

      {/* Product details modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(productWithAddons) => {
            console.log("Adding from modal:", productWithAddons);
            handleAddToCart(productWithAddons);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Order type modal */}
      <OrderTypeModal
        isOpen={isOrderTypeModalOpen}
        onClose={() => setIsOrderTypeModalOpen(false)}
        onSelect={handleOrderTypeSelect}
      />
    </div>
  )
}