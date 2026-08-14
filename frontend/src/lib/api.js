import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const getAdminPin = () => localStorage.getItem("mls_admin_pin") || "";
export const setAdminPin = (pin) => localStorage.setItem("mls_admin_pin", pin);
export const clearAdminPin = () => localStorage.removeItem("mls_admin_pin");

export const adminHeaders = () => ({ "X-Admin-Pin": getAdminPin() });
