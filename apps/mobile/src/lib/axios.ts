import axios from "axios";
import { environment } from "@/config/environment";

export const apiClient = axios.create({
	baseURL: environment.apiUrl,
});
