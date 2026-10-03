const isServer = typeof window === "undefined";

export const API_URL = isServer
    ? (process.env.PUBLIC_API_URL || "http://127.0.0.1:5147/api")
    : "/api";

export const HUB_URL = isServer
    ? (process.env.PUBLIC_HUB_URL || "http://127.0.0.1:5147/hubs/orders")
    : "/hubs/orders";