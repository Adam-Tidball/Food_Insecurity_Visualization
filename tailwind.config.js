/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**.html", "./static/js/**.js"],
  safelist: [
    'fill-primary',
    'fill-secondary',
    'fill-accent',
    'fill-success',
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          

        "primary": "#312e81",
                  

        "secondary": "#facc15",
                  

        "accent": "#fca5a5",
                  

        "neutral": "#0c4a6e",
                  

        "base-100": "#ffedd5",
                  

        "info": "#374151",
                  

        "success": "#14532d",
                  

        "warning": "#f2813a",
                  

        "error": "#dc2626",
          },
        },
      ],
    },
    plugins: [
      require('daisyui'),
    ],
}

