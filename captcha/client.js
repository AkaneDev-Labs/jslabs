---
layout: null
permalink: /captcha/client.js
---

const CAPTCHA_REGISTRY = [
{% for captcha in site.captchas %}
    {
        id: {{ captcha.id | jsonify }},
        name: {{ captcha.name | jsonify }},
        version: {{ captcha.version | jsonify }},
        script: {{ captcha.script | jsonify }}
    }{% unless forloop.last %},{% endunless %}
{% endfor %}
];

console.log("AkaneDev CAPTCHA loaded");
console.log("Available CAPTCHAs:", CAPTCHA_REGISTRY);