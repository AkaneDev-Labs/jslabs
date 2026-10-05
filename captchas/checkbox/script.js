(() => {
  const check = document.getElementById("check");
  const message = document.getElementById("message");
  document.getElementById("verify").addEventListener("click", () => {
    if (check.checked) {
      message.textContent = "Verified!";
      window.parent.postMessage({source:"akane-captcha",type:"complete",captcha:"checkbox",result:{success:true}}, "*");
    } else {
      message.textContent = "Please check the box.";
    }
  });
  window.captchaReset = () => { check.checked = false; message.textContent = ""; };
})();