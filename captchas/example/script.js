(() => {
    const button = document.getElementById("complete");

    button?.addEventListener("click", () => {
        window.parent.postMessage({
            source: "akane-captcha",
            type: "complete",
            captcha: "example",
            result: { success: true }
        }, "*");
    });

    window.captchaReset = () => {
        if (button) button.disabled = false;
    };
})();
