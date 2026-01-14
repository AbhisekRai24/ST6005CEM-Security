// import React from 'react'
// import { useParams } from 'react-router-dom';
// import { useGetOneCategory } from '../../hooks/admin/useAdminCategory'
// import { getBackendImageUrl } from '../../utils/backend-image'

// export default function ViewCategory() {
//   const { id } = useParams()
//   const { category, error, isPending } = useGetOneCategory(id)
//   if (error) <>{error}</>
//   return (
//     <div>ViewCategory
//       {category.name}
//       <img src={getBackendImageUrl(category.filepath)}></img>
//     </div>
//   )
// }
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetOneCategory } from '../../hooks/admin/useAdminCategory';
import { getBackendImageUrl } from '../../utils/backend-image';

export default function ViewCategory() {
  const { id } = useParams();
  const { category, error, isPending } = useGetOneCategory(id);

  if (isPending) {
    return <p className="text-gray-500">Loading category...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message || error}</p>;
  }

  if (!category) {
    return <p className="text-gray-500">Category not found.</p>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 mt-12">

      <img
        src={getBackendImageUrl(category.filepath)}
        alt={category.name}
        className="w-full h-72 object-cover rounded-lg shadow-md border border-blue-300 mb-6"
      />

      <h2 className="text-2xl font-semibold text-blue-900 mb-4">
        Category: <span className="font-bold">"{category.name}"</span>
      </h2>

      <hr className="border-blue-300 mb-6" />


    </div>
  );


}
