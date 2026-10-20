import routes from "../Routes/routes.js";


const VLM = {

    BasePath: new URL(".", window.location.href).pathname,

    async Load(path) {

        const loader = document.getElementById("page-loader");

        const showLoader = () => {
            if (!loader) return;

            loader.classList.remove(
                "opacity-0",
                "pointer-events-none"
            );

            loader.classList.add("opacity-100");
        };

        const hideLoader = () => {
            if (!loader) return;

            loader.classList.remove("opacity-100");
            loader.classList.add("opacity-0");

            setTimeout(() => {
                loader.classList.add("pointer-events-none");
            }, 200);
        };

        try {

            // Show loader before starting page load
            showLoader();

            const page = routes[path];

            if (!page) {
                throw new Error(`Page not found: ${path}`);
            }

            const response = await fetch(
                `${this.BasePath}${page.content}`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load page: ${page.content}`
                );
            }

            const html = await response.text();

            const main = document.querySelector(
                "#page-main-entry-point"
            );

            main.innerHTML = html;

            // Load page-specific JS
            if (page.script) {

                const module = await import(
                    `${this.BasePath}${page.script}`
                );

                if (typeof module.init === "function") {
                    await module.init();
                }
            }

        } catch (error) {

            console.error("Page loading error:", error);

            throw error;

        } finally {

            // Hide loader whether loading succeeds or fails
            hideLoader();
        }
    }

};


// Get current route
function GetCurrentPage() {

    const params = new URLSearchParams(
        window.location.search
    );

    return params.get("page") || "/";
}


// Handle navigation
document.addEventListener("click", event => {

    const link = event.target.closest("a");

    if (!link) return;

    if (link.origin !== window.location.origin) {
        return;
    }

    if (!link.pathname.startsWith(VLM.BasePath)) {
        return;
    }

    event.preventDefault();

    const url = new URL(link.href);

    const route = url.searchParams.get("page") || "/";

    history.pushState({}, "", link.href);

    VLM.Load(route);
});


// Browser back / forward
window.addEventListener("popstate", () => {

    VLM.Load(GetCurrentPage());

});


// Start application
VLM.Load(GetCurrentPage());