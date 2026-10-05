(() => {
  const names = ["red","blue","green","yellow"];
  const target = document.getElementById("target");
  const buttons = document.getElementById("buttons");
  const message = document.getElementById("message");
  let correct;
  function setup() {
    buttons.replaceChildren();
    correct = names[Math.floor(Math.random() * names.length)];
    target.textContent = correct;
    [...names].sort(() => Math.random() - 0.5).forEach(name => {
      const button = document.createElement("button");
      button.className = "choice";
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => {
        if (name === correct) {
          message.textContent = "Verified!";
          window.parent.postMessage({source:"akane-captcha",type:"complete",captcha:"color",result:{success:true}}, "*");
        } else {
          message.textContent = "Incorrect. New challenge generated.";
          setup();
        }
      });
      buttons.appendChild(button);
    });
  }
  window.captchaReset = setup;
  setup();
})();