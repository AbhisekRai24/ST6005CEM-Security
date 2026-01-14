import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAllProductService, createProductService, deleteProductService, getProductsByCategoryService, getProductByIdService, updateProductService } from "../../services/admin/productService";
import { useState } from "react";
import { toast } from "react-toastify";


export const useNewAdminProduct = ({ pageNumber = 1, pageSize = 10, search = "" } = {}) => {
    const query = useQuery({
        queryKey: ["admin_product", pageNumber, pageSize, search],
        queryFn: () =>
            getAllProductService({
                page: pageNumber,
                limit: pageSize,
                search,
            }),
        keepPreviousData: true,
    });

    const products = query.data?.data || [];
    const pagination = query.data?.pagination || {
        page: 1,
        totalPages: 1,
        limit: 10,
    };
    const canPreviousPage = pagination.page > 1;
    const canNextPage = pagination.page < pagination.totalPages;

    return {
        ...query,
        products,
        pagination,
        canPreviousPage,
        canNextPage,
    };
};

export const useAdminProduct = () => {
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState("")

    const query = useQuery(
        {
            queryKey: ["admin_product", pageNumber, pageSize, search], // key/variable to rerun function
            queryFn: () => {
                return getAllProductService(
                    {
                        page: pageNumber,
                        limit: pageSize,
                        search: search
                    } // params
                )
            },
            keepPreviousData: true // cache old data
        }
    )
    const products = query.data?.data || []
    const pagination = query.data?.pagination || {
        page: 1,
        totalPages: 1,
        limit: 10
    }
    const canPreviousPage = pagination.page > 1
    const canNextPage = pagination.page < pagination.totalPages

    return {
        ...query,
        products,
        pageNumber,
        setPageNumber,
        pagination,
        canPreviousPage,
        canNextPage,
        pageSize,
        setPageSize,
        search,
        setSearch
    }
}


export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProductService,
        onSuccess: () => {
            toast.success("Product created");
            queryClient.invalidateQueries(["admin_products"]);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to create product");
        }
    });
};

export const useGetProductById = (id) => {
    return useQuery({
        queryKey: ["admin_product_by_id", id],
        queryFn: () => getProductByIdService(id),
        enabled: !!id,
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProductService,
        onSuccess: () => {
            toast.success("Product deleted");
            queryClient.invalidateQueries(["admin_product"]); // ensure it refetches list
        },
        onError: (err) => {
            toast.error(err.message || "Failed to delete product");
        }
    });
};
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateProductService(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["admin_product_by_id", variables.id]);
            queryClient.invalidateQueries(["admin_product"]);
            toast.success("Product updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update product");
            console.error("Failed to update product", error);
        },
    });
};
export const useProductsByCategory = (categoryId) => {
    return useQuery({
        queryKey: ["products_by_category", categoryId],
        queryFn: () => getProductsByCategoryService(categoryId),
        enabled: !!categoryId
    })
}