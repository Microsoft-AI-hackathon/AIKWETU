export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close"); // Define the close button

  dialogueUI.style.display = "block";

  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 1);

   // Function to handle closing the dialogue
  function onClose() {
    onDisplayEnd();
    dialogueUI.style.display = "none"; // Hide the dialogue
    dialogue.innerHTML = ""; // Clear the dialogue content
    clearInterval(intervalRef); // Ensure the typing interval is cleared
    closeBtn.removeEventListener("click", onClose); // Clean up event listener
  }

  // if (closeBtn) {
    closeBtn.addEventListener("click", onClose);
  // }

  // Handle radio button answers if they exist
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("click", () => {
      const selectedAnswer = input.value; // Store the selected answer
      onClose(); // Close the dialogue box
    });
  });
}

document.getElementById("close").addEventListener("click", () => {
  document.getElementById("textbox-container").style.display = "none";
});

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}



