import { environment } from "@/config/environment";
import axios from "axios";


export const apiClient = axios.create({
  baseURL: environment.apiUrl,
});