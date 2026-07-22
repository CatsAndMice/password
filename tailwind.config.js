/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--color-bg-primary)',
                'bg-card': 'var(--color-bg-card)',
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                primary: 'var(--color-primary)',
                'primary-hover': 'var(--color-primary-hover)',
                border: 'var(--color-border)',
            },
        },
    },
    plugins: [],
}