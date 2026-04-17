export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1D4ED8",
        brandLight: "#DBEAFE",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
