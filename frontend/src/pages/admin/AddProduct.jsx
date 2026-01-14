import React from 'react';
import Sidebar from '../../components/admin/sidebar';
import AddProductForm from '../../components/admin/AddProductForm';

const AddProductPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">

            <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <AddProductForm />
            </div>
        </div>
    );
};

export default AddProductPage;
