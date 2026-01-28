import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllOrdersApi,
  getOrdersByUserApi,
  createOrderApi,
  updateOrderStatusApi,
  deleteOrderApi
} from "../api/orderApi";

export const createOrderService = async (data) => {
  return await createOrderApi(data);
};

export const getAllOrdersService = async () => {
  const response = await getAllOrdersApi();
  return response.data;  
};

export const getOrdersByUserService = async (userId) => {
  const response = await getOrdersByUserApi(userId);
  return response.data; 
};

export const updateOrderStatusService = async ({ orderId, status }) => {
  const res = await updateOrderStatusApi(orderId, status);
  return res.data;
};


export const deleteOrderService = async (orderId) => {
  const res = await deleteOrderApi(orderId);
  return res.data;
};