import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Snackbar,
    IconButton,
    Stack,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useGetProductById, useUpdateProduct } from "../../../hooks/admin/useAdminProduct";
import { getBackendImageUrl } from "../../../utils/backend-image";

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading, error } = useGetProductById(id);
    const updateProduct = useUpdateProduct();

    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        categoryId: "",
        addons: [],
        image: null,
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || "",
                price: product.price || "",
                description: product.description || "",
                categoryId: product.categoryId?._id || "",
                addons: product.addons || [],
                image: null,
            });
        }
    }, [product]);

    if (isLoading) return <Typography>Loading product data...</Typography>;
    if (error) return <Typography color="error">Error loading product: {error.message}</Typography>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddonChange = (index, field, value) => {
        const updatedAddons = [...form.addons];
        updatedAddons[index][field] = field === "price" ? Number(value) : value;
        setForm((prev) => ({ ...prev, addons: updatedAddons }));
    };

    const addAddon = () => {
        setForm((prev) => ({ ...prev, addons: [...prev.addons, { name: "", price: 0 }] }));
    };

    const removeAddon = (index) => {
        setForm((prev) => ({ ...prev, addons: prev.addons.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("description", form.description);
            formData.append("categoryId", form.categoryId);
            formData.append("addons", JSON.stringify(form.addons));
            if (form.image) {
                formData.append("productImage", form.image);
            }

            await updateProduct.mutateAsync({ id, data: formData });

            setSnackbar({ open: true, message: "Product updated successfully!", severity: "success" });

            setTimeout(() => {
                navigate(`/admin/products/${id}`);
            }, 1500);
        } catch (err) {
            setSnackbar({ open: true, message: "Failed to update product.", severity: "error" });
        }
    };


    return (
        <Paper sx={{ maxWidth: 600, p: 4, mx: "auto", mt: 6 }}>
            <Typography variant="h5" gutterBottom>
                Edit Product
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
                <TextField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                />
                <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={form.description}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Category ID"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleInputChange}
                    required
                />

                {/* Add-ons */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Add-ons
                    </Typography>
                    {form.addons.map((addon, index) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={index} mb={1}>
                            <TextField
                                label="Name"
                                value={addon.name}
                                onChange={(e) => handleAddonChange(index, "name", e.target.value)}
                                required
                            />
                            <TextField
                                label="Price"
                                type="number"
                                inputProps={{ min: 0 }}
                                value={addon.price}
                                onChange={(e) => handleAddonChange(index, "price", e.target.value)}
                                required
                            />
                            <IconButton color="error" onClick={() => removeAddon(index)} size="large">
                                <Delete />
                            </IconButton>
                        </Stack>
                    ))}
                    <Button startIcon={<Add />} variant="outlined" onClick={addAddon}>
                        Add Add-on
                    </Button>
                </Box>

                {/* Image upload */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Product Image
                    </Typography>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {product.productImage && (
                        <Box mt={2}>
                            <img
                                src={getBackendImageUrl(product.productImage)}
                                alt="Current product"
                                style={{ maxWidth: "100%", borderRadius: 8 }}
                            />
                        </Box>
                    )}
                </Box>

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                    Save Changes
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Paper>
    );
}
