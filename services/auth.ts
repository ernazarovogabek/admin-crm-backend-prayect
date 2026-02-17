import axios from "../axios/axioss";

export const loginUser = async (data) => {
  try {
    const response = await axios.post("/login", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};