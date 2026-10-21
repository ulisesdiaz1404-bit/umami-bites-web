// Tema claro/oscuro. Va en un módulo común (no "use client") para que el layout
// de servidor reciba el string real del script y no una referencia de cliente.

export const THEME_STORAGE_KEY = "umami-theme";

/**
 * Se inyecta en <head> y corre antes del primer pintado: aplica el tema guardado
 * (o el del sistema) para que no haya parpadeo claro → oscuro.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;
