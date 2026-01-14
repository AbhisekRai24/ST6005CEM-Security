import { useMutation, useQuery ,useQueryClient } from "@tanstack/react-query";
import { createOrderService, getAllOrdersService, getOrdersByUserService , updateOrderStatusService, 
  deleteOrderService
} from "../services/orderService";
import { toast } from "react-toastify";

// Hook to create an order
export const useCreateOrder = (onSuccess) => {
  return useMutation({
    mutationFn: createOrderService,
    onSuccess: () => {
      toast.success("Your order has been placed. Thank you!");
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error("Failed to place order.");
    },
  });
};

// Hook to fetch all orders
export const useFetchAllOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getAllOrdersService,
  });
};

// Hook to fetch orders by a specific userId
export const useFetchOrdersByUser = (userId) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => getOrdersByUserService(userId),
    enabled: !!userId,
  });
};
// ✅ Update status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatusService,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]); // refetch orders
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrderService, // ✅ correct usage
    onSuccess: () => {
      toast.success("Order deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["ordersByUser"] });
    },
    onError: () => {
      toast.error("Failed to delete order.");
    },
  });
};