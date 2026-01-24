// import { useContext } from "react"; // ✅ Required import
// import { AuthContext } from '../auth/AuthProvider';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import MainLayout from '../layouts/AdminMainLayout'
// import Login from '../pages/login_page'
// import Home from '../pages/home_page'
// import Register from '../pages/register_page'
// import Dashboard from '../pages/admin/Dashboard'
// import AdminLayout from '../layouts/AdminSideBar'
// import AddProducts from '../pages/admin/AddProduct'
// import CategoryManagement from '../pages/admin/CategoryManagement'
// import ProductManagement from '../pages/admin/ProductManagement'
// import UpdateCategory from '../pages/admin/UpdateCategory'
// import GuestRoute from './GuestRoute'
// import NormalUserRoute from './NormalUserRoute'
// import ViewCategory from '../pages/admin/ViewCategory'
// import CreateCategory from '../pages/admin/CreateCategory'
// import UserManagement from '../pages/admin/UserManagement'
// import CreateUserForm from '../pages/admin/CreateUser'
// import UpdateUserForm from '../components/admin/UpdateUserForm'
// import Page from "../components/UserAllProducts"
// import MyOrders from "../pages/MyOrders"
// import UserMainLayout from "../layouts/UserMainLayout"
// import CategoryProducts from "../components/CategoryProduct";
// import ProfilePage from "../components/ProfilePage";
// import Notifications from "../pages/Notifications";
// import UserHomePage from "../components/UserMainHome";
// import BannerForm from "../components/admin/product/BannerManagement";
// import ProductDetail from "../components/admin/product/ProductDetail";
// import EditProduct from "../components/admin/product/EditProduct";
// import ResetPassword from "../components/auth/ResetPassword";
// import RequestReset from "../components/auth/RequestReset";

// function App() {
//     const { loading } = useContext(AuthContext);

//     if (loading) return <>Loading App...</>;
//     return (

//         <Router>

//             <Routes>
//                 <Route path="/" element={<Navigate to="/login" replace />} />
//                 <Route element={<GuestRoute />}>
//                     <Route path="/login" element={<Login />} />
//                     <Route path="/register" element={<Register />} />
//                     <Route path="/reset-password/:token" element={<ResetPassword />} />
//                     <Route path="/request-reset" element={<RequestReset />} />
//                 </Route>


//                 {/* Normal user routes protected by NormalUserRoute */}
//                 <Route path='/normal/*' element={<NormalUserRoute />}>

//                     <Route element={<UserMainLayout />}>

//                         <Route path="dash" element={<Page />} />

//                         <Route path="home" element={<UserHomePage />} />

//                         <Route path="myorders" element={<MyOrders />} />
//                         <Route path="profile" element={<ProfilePage />} />
//                         <Route path="notification" element={<Notifications />} />
//                         <Route path="user/category/:categoryId" element={<CategoryProducts />} />
//                     </Route>
//                     {/* Catch all 404 for /normal */}
//                     <Route path="*" element={<>404 Not Found</>} />
//                 </Route>


//                 {/* Admin routes under AdminLayout */}
//                 <Route path="/admin/*" element={<AdminLayout />}>
//                     <Route path="dashboard" element={<Dashboard />} />
//                     <Route path="addproduct" element={<AddProducts />} />
//                     <Route path='category/:id' element={<ViewCategory />}></Route>
//                     <Route path="products" element={<ProductManagement />} />
//                     <Route path="category" element={<CategoryManagement />} />
//                     <Route path="category/:id/edit" element={<UpdateCategory />} />
//                     <Route path="user" element={<UserManagement />} />
//                     <Route path="user/create" element={<CreateUserForm />} />
//                     <Route path="user/:id/edit" element={<UpdateUserForm />} />
//                     <Route path="products/:id" element={<ProductDetail />} />
//                     <Route path="banner/create" element={<BannerForm />} />
//                     <Route path="products/:id/edit" element={<EditProduct />} />



//                     <Route path='category/create' element={<CreateCategory />}></Route>

//                 </Route>
//             </Routes>
//         </Router >

//     );
// }

// export default App;

import { useContext } from "react";
import { AuthContext } from '../auth/AuthProvider';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/AdminMainLayout';
import Login from '../pages/login_page';
import Home from '../pages/home_page';
import Register from '../pages/register_page';
import Dashboard from '../pages/admin/Dashboard';
import AdminLayout from '../layouts/AdminSideBar';
import AddProducts from '../pages/admin/AddProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import UpdateCategory from '../pages/admin/UpdateCategory';
import GuestRoute from './GuestRoute';
import NormalUserRoute from './NormalUserRoute';
import AdminRoute from '../routers/AdminRoutes';
import ViewCategory from '../pages/admin/ViewCategory';
import CreateCategory from '../pages/admin/CreateCategory';
import UserManagement from '../pages/admin/UserManagement';
import CreateUserForm from '../pages/admin/CreateUser';
import UpdateUserForm from '../components/admin/UpdateUserForm';
import Page from "../components/UserAllProducts";
import MyOrders from "../pages/MyOrders";
import UserMainLayout from "../layouts/UserMainLayout";
import CategoryProducts from "../components/CategoryProduct";
import ProfilePage from "../components/ProfilePage";
import Notifications from "../pages/Notifications";
import UserHomePage from "../components/UserMainHome";
import BannerForm from "../components/admin/product/BannerManagement";
import ProductDetail from "../components/admin/product/ProductDetail";
import EditProduct from "../components/admin/product/EditProduct";
import ResetPassword from "../components/auth/ResetPassword";
import RequestReset from "../components/auth/RequestReset";
import SettingsPage from "../components/Settings/twoFASettings";

import Unauthorized from "../pages/UnauthorizedPage";

function App() {
    const { loading } = useContext(AuthContext);

    if (loading) return <>Loading App...</>;

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Guest Routes */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/request-reset" element={<RequestReset />} />
                </Route>

                {/* Normal user routes protected by NormalUserRoute */}
                <Route path='/normal/*' element={<NormalUserRoute />}>
                    <Route element={<UserMainLayout />}>
                        <Route path="dash" element={<Page />} />
                        <Route path="home" element={<UserHomePage />} />
                        <Route path="myorders" element={<MyOrders />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />


                        <Route path="notification" element={<Notifications />} />
                        <Route path="user/category/:categoryId" element={<CategoryProducts />} />
                    </Route>
                    {/* Catch all 404 for /normal */}
                    <Route path="*" element={<>404 Not Found</>} />
                </Route>

                {/* 🔒 Admin routes protected by AdminRoute */}
                <Route path="/admin/*" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="addproduct" element={<AddProducts />} />
                        <Route path='category/:id' element={<ViewCategory />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="category" element={<CategoryManagement />} />
                        <Route path="category/:id/edit" element={<UpdateCategory />} />
                        <Route path="user" element={<UserManagement />} />
                        <Route path="user/create" element={<CreateUserForm />} />
                        <Route path="user/:id/edit" element={<UpdateUserForm />} />
                        <Route path="products/:id" element={<ProductDetail />} />
                        <Route path="banner/create" element={<BannerForm />} />
                        <Route path="products/:id/edit" element={<EditProduct />} />
                        <Route path='category/create' element={<CreateCategory />} />
                    </Route>
                </Route>

                {/* 🆕 Unauthorized page */}
                <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
        </Router>
    );
}

export default App;