---
layout: null
permalink: /captcha/client.js
---

(() => {
    "use strict";

    const registry = {
{% for captcha in site.captchas %}
        {% assign captcha_id = captcha.path | split: "/" | last | replace: ".md", "" %}
        {{ captcha_id | jsonify }}: {
            id: {{ captcha_id | jsonify }},
            name: {{ captcha.name | jsonify }},
            version: {{ captcha.version | default: 1 | jsonify }},
            html: {{ captcha.html | jsonify }},
            css: {{ captcha.css | jsonify }},
            js: {{ captcha.js | jsonify }}
        }{% unless forloop.last %},{% endunless %}
{% endfor %}
    };

    const AkaneCaptcha = {
        version: "1.1.0",

        list() {
            return Object.values(registry);
        },

        get(id) {
            return registry[id] ?? null;
        },

        async fetchAsset(path) {
            const primary = new URL(path, window.location.origin);
            primary.searchParams.set("_akane", "1.1.0");

            try {
                const response = await fetch(primary.href, { cache: "no-store" });
                if (response.ok) {
                    return response.text();
                }
            } catch (_) {
                // Fall through to the repository copy.
            }

            // GitHub Pages/Cloudflare can temporarily serve a stale 404.
            // The repository copy keeps the loader usable while the CDN catches up.
            const fallback = "https://raw.githubusercontent.com/AkaneDev-Labs/jslabs/main" + path;
            const response = await fetch(fallback, { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`Failed to load CAPTCHA asset: ${path} (HTTP ${response.status})`);
            }

            return response.text();
        },

        async mount(container, id) {
            if (!(container instanceof Element)) {
                throw new TypeError("container must be a DOM element");
            }

            const definition = registry[id];
            if (!definition) {
                throw new Error(`Unknown CAPTCHA: ${id}`);
            }

            const frame = document.createElement("iframe");
            frame.title = definition.name;
            frame.loading = "eager";
            frame.setAttribute("sandbox", "allow-scripts");
            frame.style.width = "100%";
            frame.style.border = "0";
            frame.style.minHeight = "160px";

            container.replaceChildren(frame);

            const [html, css, js] = await Promise.all([
                this.fetchAsset(definition.html),
                this.fetchAsset(definition.css),
                this.fetchAsset(definition.js)
            ]);

            const documentText = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>
${html}
<script>
window.parent.postMessage({
    source: "akane-captcha",
    type: "ready",
    captcha: ${JSON.stringify(definition.id)}
}, "*");

window.addEventListener("message", event => {
    if (event.source !== window.parent) return;
    if (event.data?.source !== "akane-captcha-host") return;

    if (event.data.type === "reset" && typeof window.captchaReset === "function") {
        window.captchaReset();
    }
});

${js}
</script>
</body>
</html>`;

            const blob = new Blob([documentText], { type: "text/html" });
            frame.src = URL.createObjectURL(blob);

            const messageHandler = event => {
                if (event.source !== frame.contentWindow) return;
                if (event.data?.source !== "akane-captcha") return;
                if (event.data.captcha !== definition.id) return;

                if (event.data.type === "complete") {
                    container.dispatchEvent(new CustomEvent("akane-captcha-complete", {
                        detail: {
                            captcha: definition.id,
                            result: event.data.result
                        }
                    }));
                }
            };

            window.addEventListener("message", messageHandler);

            return {
                frame,
                definition,
                destroy() {
                    window.removeEventListener("message", messageHandler);
                    URL.revokeObjectURL(frame.src);
                    frame.remove();
                },
                reset() {
                    frame.contentWindow?.postMessage({
                        source: "akane-captcha-host",
                        type: "reset"
                    }, "*");
                }
            };
        }
    };

    window.AkaneCaptcha = AkaneCaptcha;

    document.querySelectorAll("[data-akane-captcha]").forEach(container => {
        const id = container.dataset.akaneCaptcha;
        if (id) {
            AkaneCaptcha.mount(container, id).catch(error => {
                console.error("[AkaneCaptcha]", error);
            });
        }
    });
})();
