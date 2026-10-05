(() => {
  let a, b;
  const question = document.getElementById("question"), answer = document.getElementById("answer"), message = document.getElementById("message");
  function newQuestion(){a=Math.floor(Math.random()*8)+2;b=Math.floor(Math.random()*8)+2;question.textContent=`What is ${a} + ${b}?`;answer.value="";message.textContent="";}
  document.getElementById("submit").addEventListener("click",()=>{if(Number(answer.value)===a+b){message.textContent="Verified!";window.parent.postMessage({source:"akane-captcha",type:"complete",captcha:"math",result:{success:true}},"*");}else{message.textContent="Incorrect. Try again.";newQuestion();}});
  window.captchaReset=newQuestion; newQuestion();
})();