import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{js,ts,jsx,tsx}"], theme: { extend: { colors: { ink: "#14233A", coral: "#E9644B", amber: "#F0A039", mint: "#6FAE8A", canvas: "#F7F8F6" }, boxShadow: { soft: "0 18px 50px rgba(22,38,58,.08)" } } }, plugins: [] } satisfies Config;
