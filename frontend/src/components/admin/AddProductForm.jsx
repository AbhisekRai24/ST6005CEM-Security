import React, { useState, useContext, useEffect } from "react";
import {
    TextField,
    Button,
    MenuItem,
    Typography,
    Paper,
    Grid,
    IconButton,
    Box,
    InputLabel,
    FormControl,
    Select,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add, Delete } from "@mui/icons-material";
import { AuthContext } from "../../auth/AuthProvider";
import { useCreateProduct } from "../../hooks/admin/useAdminProduct";
import { useAdminCategory } from "../../hooks/admin/useAdminCategory";

const FormWrapper = styled(Paper)(({ theme }) => ({

    padding: theme.spacing(4),
    marginTop: theme.spacing(5),
    maxWidth: "800px",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
}));

export default function AddProductForm() {
    const { user } = useContext(AuthContext);
    const userId = user?._id;
    const { categories, isLoading: loadingCategories } = useAdminCategory();
    const { mutate: createProduct, isLoading: creating } = useCreateProduct();

    const [formData, setFormData] = useState({
        category: "",
        itemName: "",
        description: "",
        price: "",
        image: null,
        addons: [{ name: "", price: "" }],
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!formData.image) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(formData.image);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [formData.image]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleAddonChange = (index, field, value) => {
        const updatedAddons = [...formData.addons];
        updatedAddons[index][field] = value;
        setFormData((prev) => ({ ...prev, addons: updatedAddons }));
    };

    const addAddon = () => {
        setFormData((prev) => ({
            ...prev,
            addons: [...prev.addons, { name: "", price: "" }],
        }));
    };

    const removeAddon = (index) => {
        setFormData((prev) => ({
            ...prev,
            addons: prev.addons.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");

        if (!userId) {
            setMessage("You must be logged in to add a product.");
            return;
        }

        if (!formData.itemName || !formData.price || !formData.category) {
            setMessage("Please fill required fields.");
            return;
        }

        const data = new FormData();
        data.append("name", formData.itemName);
        data.append("price", formData.price);
        data.append("categoryId", formData.category);
        data.append("userId", userId);
        data.append("description", formData.description);

        if (formData.image) {
            data.append("productImage", formData.image);
        }

        formData.addons.forEach((addon, index) => {
            if (addon.name.trim()) {
                data.append(`addons[${index}][name]`, addon.name);
                data.append(`addons[${index}][price]`, addon.price || "0");
            }
        });

        createProduct(data, {
            onSuccess: () => {
                setMessage("Product created successfully!");
                setFormData({
                    category: "",
                    itemName: "",
                    description: "",
                    price: "",
                    image: null,
                    addons: [{ name: "", price: "" }],
                });
                setPreviewUrl(null);
            },
            onError: (error) => {
                setMessage(error?.message || "Failed to create product.");
            },
        });
    };

    return (
        <FormWrapper elevation={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" gutterBottom>
                Add New Product
            </Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel>Category *</InputLabel>
                <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    label="Category *"
                >
                    <MenuItem value="">
                        <em>Select a category</em>
                    </MenuItem>
                    {loadingCategories ? (
                        <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                        categories.map((cat) => (
                            <MenuItem key={cat._id} value={cat._id}>
                                {cat.name}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                name="itemName"
                label="Item Name *"
                value={formData.itemName}
                onChange={handleChange}
                margin="normal"
                required
            />

            <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description *"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                required
            />

            <TextField
                fullWidth
                type="number"
                name="price"
                label="Price *"
                value={formData.price}
                onChange={handleChange}
                margin="normal"
                required
            />

            <Box my={2}>
                <Button variant="contained" component="label">
                    Upload Product Image
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Button>
                {formData.image && (
                    <Typography variant="body2" mt={1}>
                        {formData.image.name}
                    </Typography>
                )}
            </Box>

            {previewUrl && (
                <Box my={2}>
                    <img
                        src={previewUrl}
                        alt="preview"
                        style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }}
                    />
                </Box>
            )}

            <Typography variant="h6" mt={4}>
                Add-ons (Optional)
            </Typography>

            {formData.addons.map((addon, index) => (
                <Grid container spacing={2} key={index} alignItems="center" mt={1}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Add-on Name"
                            value={addon.name}
                            onChange={(e) => handleAddonChange(index, "name", e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Price"
                            value={addon.price}
                            onChange={(e) => handleAddonChange(index, "price", e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        {formData.addons.length > 1 && (
                            <IconButton onClick={() => removeAddon(index)} color="error">
                                <Delete />
                            </IconButton>
                        )}
                    </Grid>
                </Grid>
            ))}

            <Box mt={2}>
                <Button startIcon={<Add />} onClick={addAddon}>
                    Add another add-on
                </Button>
            </Box>

            {message && (
                <Typography
                    color={message.includes("successfully") ? "success.main" : "error"}
                    align="center"
                    mt={2}
                >
                    {message}
                </Typography>
            )}

            <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                        setFormData({
                            category: "",
                            itemName: "",
                            description: "",
                            price: "",
                            image: null,
                            addons: [{ name: "", price: "" }],
                        });
                        setPreviewUrl(null);
                    }}
                    disabled={creating}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={creating}
                >
                    {creating ? "Adding..." : "Confirm & Add Product"}
                </Button>
            </Box>
        </FormWrapper>
    );
}
