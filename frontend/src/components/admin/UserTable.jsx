"use client"

import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
    Search as SearchIcon,
    Plus,
    Eye,
    Edit,
    Trash2,
    Users,
    AlertCircle,
} from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Typography,
    Button as MuiButton,
    Grid,
    Card as MuiCard,
    CardContent as MuiCardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Chip,
    useTheme,
} from "@mui/material"

import { useAdminUser, useDeleteUser } from "../../hooks/admin/useAdminUser"

export default function UserTable() {
    const { users = [], isLoading } = useAdminUser()
    const deleteUserMutation = useDeleteUser()
    const [deleteId, setDeleteId] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate()
    const theme = useTheme()

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [users, searchTerm])

    const handleConfirmDelete = () => {
        deleteUserMutation.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
            onError: (err) => alert(err.message || "Failed to delete user"),
        })
    }

    const getRoleColor = (role) => {
        switch (role) {
            case "admin":
                return "error"
            case "moderator":
                return "secondary"
            default:
                return "default"
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "success"
            case "inactive":
                return "secondary"
            case "pending":
                return "default"
            default:
                return "default"
        }
    }

    return (
        <div style={{ padding: "24px" }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={4}>
                <Grid item>
                    <Typography variant="h4" display="flex" alignItems="center" gap={1}>
                        <Users size={28} /> User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage and monitor user accounts across your platform
                    </Typography>
                </Grid>
                <Grid item>
                    <MuiButton
                        variant="contained"
                        color="primary"
                        startIcon={<Plus />}
                        onClick={() => navigate("/admin/user/create")}
                    >
                        Add User
                    </MuiButton>
                </Grid>
            </Grid>

            {/* Stats Cards */}
            <Grid container spacing={2} mb={4}>
                {[
                    { label: "Total Users", value: users.length },
                    { label: "Active", value: users.filter((u) => u.status === "active").length },
                    { label: "Pending", value: users.filter((u) => u.status === "pending").length },
                    { label: "Admins", value: users.filter((u) => u.role === "admin").length },
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MuiCard>
                            <MuiCardContent>
                                <Typography variant="body2">{stat.label}</Typography>
                                <Typography variant="h6">{stat.value}</Typography>
                            </MuiCardContent>
                        </MuiCard>
                    </Grid>
                ))}
            </Grid>

            {/* Search Field */}
            <TextField
                variant="outlined"
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                    startAdornment: <SearchIcon size={16} style={{ marginRight: 8 }} />,
                }}
                sx={{ mb: 3 }}
            />

            {/* Table */}
            <TableContainer component={Paper} sx={{ bgcolor: theme.palette.background.paper }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <Typography fontWeight={500}>{user.username}</Typography>
                                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => navigate(`/admin/user/${user._id}`)}><Eye size={18} /></IconButton>
                                    <IconButton onClick={() => navigate(`/admin/user/${user._id}/edit`)}><Edit size={18} /></IconButton>
                                    <IconButton
                                        onClick={() => setDeleteId(user._id)}
                                        disabled={deleteUserMutation.isLoading && deleteId === user._id}
                                    >
                                        {deleteUserMutation.isLoading && deleteId === user._id
                                            ? <CircularProgress size={18} />
                                            : <Trash2 size={18} />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography align="center" color="text.secondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>
                    <AlertCircle style={{ color: "red", marginRight: 8 }} /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action is permanent.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setDeleteId(null)}>Cancel</MuiButton>
                    <MuiButton
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={deleteUserMutation.isLoading}
                        startIcon={
                            deleteUserMutation.isLoading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <Trash2 size={16} />
                            )
                        }
                    >
                        {deleteUserMutation.isLoading ? "Deleting..." : "Delete"}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    )
}
