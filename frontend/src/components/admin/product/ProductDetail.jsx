"use client"
import { useParams, useNavigate } from "react-router-dom"
import { useGetProductById } from "../../../hooks/admin/useAdminProduct"
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Chip,
    Skeleton,
    Alert,
    Divider,
    Box,
    Button,
} from "@mui/material"
import { User, Package, IndianRupee, Tag, FileText, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading, error } = useGetProductById(id)
    const [openDialog, setOpenDialog] = useState(false)


    if (isLoading) {
        return (
            <Box maxWidth={768} mx="auto" p={3}>
                <Skeleton variant="rectangular" height={40} width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" height={30} width="80%" />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 4 }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box maxWidth={768} mx="auto" p={3}>
                <Alert severity="error" icon={<AlertCircle size={20} />}>
                    Error loading product: {error.message}
                </Alert>
            </Box>
        )
    }

    if (!data) {
        return (
            <Box maxWidth={768} mx="auto" p={3}>
                <Alert icon={<Package size={20} />}>Product not found</Alert>
            </Box>
        )
    }

    const product = data

    // Image URL logic, adjust base URL as per your backend
    const imageUrl = product.productImage
        ? `http://localhost:5050/${product.productImage.replace("\\", "/")}`
        : null

    return (
        <Box maxWidth={768} mx="auto" p={3} display="flex" flexDirection="column" gap={5}>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {product.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h5" fontWeight="semibold" color="green">
                            Rs. {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                        {/* <Typography variant="h5" fontWeight="semibold" color="green">
                            {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography> */}
                    </Box>
                </Box>
                <Chip
                    icon={<Package size={14} />}
                    label={`Product ID: ${id}`}
                    variant="outlined"
                    size="small"
                />
            </Box>
            <Divider />

            {/* Main Content Grid */}
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
                {/* Product Information Card */}
                <Card
                    sx={{
                        boxShadow: 4,
                        transition: "box-shadow 0.3s ease",
                        "&:hover": { boxShadow: 8 },
                    }}
                >
                    <CardHeader
                        title={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Tag size={20} color="#1976d2" />
                                <Typography variant="h6">Product Information</Typography>
                            </Box>
                        }
                        sx={{ pb: 1 }}
                    />
                    <CardContent>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            p={1.5}
                            bgcolor="action.hover"
                            borderRadius={1}
                            mb={2}
                        >
                            <Typography fontWeight="medium" color="text.secondary">
                                Category
                            </Typography>
                            <Chip variant="outlined" label={product.categoryId?.name || "N/A"} />
                        </Box>

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            p={1.5}
                            bgcolor="action.hover"
                            borderRadius={1}
                        >
                            <Typography fontWeight="medium" color="text.secondary">
                                Price
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <IndianRupee size={16} color="green" />
                                <Typography fontWeight="semibold" color="green">
                                    {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Seller Information Card */}
                <Card
                    sx={{
                        boxShadow: 4,
                        transition: "box-shadow 0.3s ease",
                        "&:hover": { boxShadow: 8 },
                    }}
                >
                    <CardHeader
                        title={
                            <Box display="flex" alignItems="center" gap={1}>
                                <User size={20} color="#1976d2" />
                                <Typography variant="h6">Seller Information</Typography>
                            </Box>
                        }
                        sx={{ pb: 1 }}
                    />
                    <CardContent>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            p={1.5}
                            bgcolor="action.hover"
                            borderRadius={1}
                            mb={2}
                        >
                            <Typography fontWeight="medium" color="text.secondary">
                                Name
                            </Typography>
                            <Typography fontWeight="semibold">
                                {product.sellerId?.firstName || "N/A"}
                            </Typography>
                        </Box>

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            p={1.5}
                            bgcolor="action.hover"
                            borderRadius={1}
                        >
                            <Typography fontWeight="medium" color="text.secondary">
                                Email
                            </Typography>
                            <Typography color="text.secondary" fontSize="0.875rem">
                                {product.sellerId?.email || "N/A"}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Description Section */}
            <Card
                sx={{
                    boxShadow: 4,
                    transition: "box-shadow 0.3s ease",
                    "&:hover": { boxShadow: 8 },
                }}
            >
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center" gap={1}>
                            <FileText size={20} color="#1976d2" />
                            <Typography variant="h6">Product Description</Typography>
                        </Box>
                    }
                    sx={{ pb: 1 }}
                />
                <CardContent>
                    <Box
                        p={2}
                        bgcolor="action.selected"
                        borderRadius={1}
                        borderLeft={4}
                        borderColor="primary.main"
                    >
                        <Typography color="text.secondary" lineHeight={1.6}>
                            {product.description || "No description available."}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Product Images Section with Edit Button */}
            <Card
                sx={{
                    boxShadow: 4,
                    transition: "box-shadow 0.3s ease",
                    "&:hover": { boxShadow: 8 },
                }}
            >
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={1}>
                                <Package size={20} color="#1976d2" />
                                <Typography variant="h6">Product Images</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => navigate(`/admin/products/${id}/edit`)}
                            >
                                Edit Product
                            </Button>
                        </Box>
                    }
                    sx={{ pb: 1 }}
                />
                <CardContent>
                    {imageUrl ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                                mt: 1,
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="Product"
                                style={{ maxHeight: 300, width: "auto", borderRadius: 8 }}
                            />
                        </Box>
                    ) : (
                        <Box
                            height={128}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bgcolor="action.selected"
                            borderRadius={1}
                            border="2px dashed"
                            borderColor="text.disabled"
                            flexDirection="column"
                            gap={1}
                        >
                            <Package size={32} color="rgba(0,0,0,0.2)" />
                            <Typography variant="body2" color="text.disabled" textAlign="center">
                                Product images will be displayed here
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}





// this below is working code  images too



// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Typography,
//   Paper,
//   Button,
//   Snackbar,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   useTheme,
// } from "@mui/material";
// import { useGetProductById } from "../../../hooks/admin/useAdminProduct";
// import { deleteProductService } from "../../../services/admin/productService";

// export default function ProductDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { data, isLoading, error, refetch } = useGetProductById(id);
//   const theme = useTheme();

//   const [openDialog, setOpenDialog] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

//   if (isLoading) return <Typography>Loading product details...</Typography>;
//   if (error) return <Typography color="error">Error: {error.message}</Typography>;
//   if (!data) return <Typography>Product not found</Typography>;

//   const product = data;

//   const handleDelete = async () => {
//     try {
//       await deleteProductService(product._id);
//       setSnackbar({ open: true, message: "Product deleted successfully", severity: "success" });
//       navigate("/admin/products");
//     } catch (err) {
//       setSnackbar({ open: true, message: "Failed to delete product", severity: "error" });
//     } finally {
//       setOpenDialog(false);
//     }
//   };

//   return (
//     <Paper
//       elevation={4}
//       sx={{
//         p: 4,
//         maxWidth: 800,
//         mx: "auto",
//         mt: 5,
//         bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
//         color: theme.palette.text.primary,
//         borderRadius: 3,
//       }}
//     >
//       <Typography variant="h4" gutterBottom>{product.name}</Typography>
//       <Typography variant="h6">Price: Rs. {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
//       <Typography>Category: {product.categoryId?.name || "N/A"}</Typography>
//       <Typography>Seller: {product.sellerId?.firstName || "N/A"} ({product.sellerId?.email || "N/A"})</Typography>
//       <Typography mt={2}>Description: {product.description || "No description available."}</Typography>

//       {product.productImage && (
//         <img
//           src={`http://localhost:5050/${product.productImage.replace("\\", "/")}`}
//           alt="Product"
//           style={{ marginTop: 20, borderRadius: 8, maxHeight: 300 }}
//         />
//       )}

//       <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
//         <Button variant="contained" color="primary" onClick={() => navigate(`/admin/products/${product._id}/edit`)}>
//           Edit Product
//         </Button>
//         <Button variant="outlined" color="error" onClick={() => setOpenDialog(true)}>
//           Delete Product
//         </Button>
//       </div>

//       {/* Confirmation Modal */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <DialogContentText>Are you sure you want to delete this product?</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           <Button color="error" onClick={handleDelete}>Delete</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Toast Notification */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         message={snackbar.message}
//       />
//     </Paper>
//   );
// }

