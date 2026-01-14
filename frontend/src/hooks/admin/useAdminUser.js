// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getAllUserService, deleteUserService, createUserService,updateUserService } from "../../services/admin/userService";
// import { toast } from "react-toastify";





// export const useCreateUser = (options = {}) => {
//     return useMutation({
//         mutationFn: createUserService,
//         onSuccess: (data) => {
//             toast.success(data?.message || "User created successfully");
//             if (options.onSuccess) {
//                 options.onSuccess(data);
//             }
//         },
//         onError: (error) => {
//             toast.error(error?.message || "Failed to create user");
//             if (options.onError) {
//                 options.onError(error);
//             }
//         }
//     });
// };
// export const useAdminUser = () => {
//     const query = useQuery(
//         {
//             queryKey: ["admin_user"],
//             queryFn: () =>
//                 getAllUserService()
//         }
//     )
//     const users = query.data?.data || []
//     return {
//         ...query, users
//     }
// }


// export const useUpdateUser = (options = {}) => {
//     return useMutation({
//         mutationFn: updateUserService,
//         onSuccess: (data) => {
//             toast.success(data?.message || "User updated successfully");
//             options?.onSuccess?.(data);
//         },
//         onError: (error) => {
//             toast.error(error?.message || "Failed to update user");
//             options?.onError?.(error);
//         }
//     });
// };


// export const useDeleteUser = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: deleteUserService,
//         onSuccess: () => {
//             // Invalidate or refetch user list query after delete
//             queryClient.invalidateQueries(["users"]);
//         },
//         onError: (error) => {
//             // Optional: handle error globally or log
//             console.error("Delete failed:", error);
//         }
//     });
// };

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllUserService,
  deleteUserService,
  createUserService,
  updateUserService,
  getUserByIdService
} from "../../services/admin/userService";
import { toast } from "react-toastify";

export const useCreateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserService,
    onSuccess: (data) => {
      toast.success(data?.message || "User created successfully");
      queryClient.invalidateQueries(["admin_user"]); // Refetch user list after create
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create user");
      options?.onError?.(error);
    },
  });
};

export const useAdminUser = () => {
  const query = useQuery({
    queryKey: ["admin_user"],
    queryFn: () => getAllUserService(),
  });
  const users = query.data?.data || [];
  return {
    ...query,
    users,
  };
};
export const useGetUserById = (id) => {
  return useQuery({
    queryKey: ["admin_user", id],
    queryFn: () => getUserByIdService(id),
    enabled: !!id,
  });
};

export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserService,
    onSuccess: (data) => {
      toast.success(data?.message || "User updated successfully");
      queryClient.invalidateQueries(["admin_user"]); // Refetch after update
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update user");
      options?.onError?.(error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserService,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries(["admin_user"]); // Refetch after delete
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete user");
      console.error("Delete failed:", error);
    },
  });
};
