// utils
function checkIfImageExists(url, callback) {
  const img = new Image();
  img.src = url;

  if (img.complete) {
    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };
    
    img.onerror = () => {
      callback(false);
    };
  }
}

function replaceImageIfExists(image, newUrl, whenexist = ()=>{}) {
  checkIfImageExists(newUrl, (result) => {
    if(result) {
      image.src = newUrl;
      whenexist();
    }
  });
}

function getID() {
  if(document.currentScript.id) {
    return 'id="' + document.currentScript.id + '" ';
  } else {
    return "";
  }
}

function getPortrait() {
  if(document.currentScript.getAttribute('portrait'))
    return document.currentScript.getAttribute('portrait');
  else
    return "https://lilithdev.neocities.org/shrine/vg/omori/sprites/faces/omori_${emotion}.gif";
}

// I do this to make all variables be scoped instead of clashing if you have a second characterbox on your page
{
  // List of emotions, including what happens if they are inflicted with a type of emotion (angry turns enraged to furious)
  // An empty string means that you can't feel this emotion again (otherwise if empty it assumes it can make you stage 1 again)
  // If an emotion isn't listed here then it won't be affected by inflict(), makeSad() ect..
  const emotionList = {
    neutral: { name: "neutral", sad: "sad", happy: "happy", angry: "angry" },
    sad: { name: "sad", sad: "depressed" },
    depressed: { name: "depressed", sad: "miserable" },
    miserable: { name: "miserable", sad: "" },
    happy: { name: "happy", happy: "ectastic" },
    ectastic: { name: "ectastic", happy: "manic" },
    manic: { name: "manic", happy: "" },
    angry: { name: "angry", angry: "enraged" },
    enraged: { name: "enraged", angry: "furious" },
    furious: { name: "furious", angry: "" },
    scared: { name: "scared" }
  }
  
  // Insert the html of the box underneath the script tag including our new ID and a portrait by default
  document.currentScript.insertAdjacentHTML("afterend", `
    <characterbox ${getID()} class="player-box status">
      <!--<link href="/util/characterbox.css" rel="stylesheet" type="text/css" media="all">-->
      <style>@import url("https://lilithdev.neocities.org/util/characterbox.css");</style>
      <div class="emotion-box">
        <img class="emotion-image" src="https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/emotion_neutral.png">
        <div class="emotion-text"></div>
      </div>
      <div class="portrait segment">
        <div class="photo-box">
          <img src="https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/bg_neutral.png" class="portrait-bg photo-stack">
          <img src="https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/bg_neutral.png" class="portrait-alt-bg photo-stack">
          <img src="${getPortrait().replace("${emotion}", "neutral")}" class="portrait photo-stack">
        </div>
      </div>
      <div class="health stat segment">
        <img src="https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/heart.png" style="image-rendering: pixelated;">
        <div class="health-bar stat-bar">
          <div class="stat-bar-text">20/20</div>
          <div class="health-bar-fill stat-bar-fill"></div>
        </div>
      </div>
      <div class="juice stat segment">
        <img src="https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/juice.png" style="image-rendering: pixelated;">
        <div class="juice-bar stat-bar">
          <div class="stat-bar-text">10/10</div>
          <div class="juice-bar-fill stat-bar-fill" style=""></div>
        </div>
      </div>
    </characterbox>
  `);
  
  // Remove the script ID to avoid duplicates
  document.currentScript.removeAttribute('id');
  
  // Since we append it afterwards it will always end up being next
  let characterBox = document.currentScript.nextElementSibling;
  
  // Hide excess ui
  if(document.currentScript.getAttribute('minimized') !== null) {
    characterBox.classList.add("minimize");
  }
  
  // Saves nodes to avoid excessive querying
  characterBox.nodes = {
    altBg: characterBox.querySelector(":scope .portrait-alt-bg"),
    bg: characterBox.querySelector(":scope .portrait-bg"),
    face: characterBox.querySelector(":scope .portrait.photo-stack"),
    emotion: characterBox.querySelector(":scope .emotion-image"),
    emotionBox: characterBox.querySelector(":scope .emotion-box"),
    emotionText: characterBox.querySelector(":scope .emotion-text"),
    healthBar: characterBox.querySelector(":scope .health-bar .stat-bar-fill"),
    healthText: characterBox.querySelector(":scope .health-bar .stat-bar-text"),
    juiceBar: characterBox.querySelector(":scope .juice-bar .stat-bar-fill"),
    juiceText: characterBox.querySelector(":scope .juice-bar .stat-bar-text"),
  };
  
  // Update health
  characterBox.maxHealth = document.currentScript.getAttribute('max-health') ? document.currentScript.getAttribute('max-health') : 20;
  characterBox.health = document.currentScript.getAttribute('health') ? document.currentScript.getAttribute('health') : characterBox.maxHealth;
  characterBox.maxJuice = document.currentScript.getAttribute('max-juice') ? document.currentScript.getAttribute('max-juice') : 10;
  characterBox.juice = document.currentScript.getAttribute('juice') ? document.currentScript.getAttribute('juice') : characterBox.maxJuice;
  characterBox.updateStats = () => {
    //characterBox.nodes.healthBar.style.clipPath = "rect(0px 0px 100% " + (characterBox.health / characterBox.maxHealth * 100) + "%)";
    characterBox.nodes.healthBar.style.clipPath = "inset(0 " + (100- (characterBox.health / characterBox.maxHealth * 100)) + "% 0 0)";
    characterBox.nodes.healthText.innerText = characterBox.health + "/" + characterBox.maxHealth;
    
    //characterBox.nodes.juiceBar.style.clipPath = "rect(0px 0px 100% " + (characterBox.juice / characterBox.maxJuice * 100) + "%)";
    characterBox.nodes.juiceBar.style.clipPath = "inset(0 " + (100 - (characterBox.juice / characterBox.maxJuice * 100)) + "% 0 0)";
    characterBox.nodes.juiceText.innerText = characterBox.juice + "/" + characterBox.maxJuice;
  }
  characterBox.updateStats();
  characterBox.setHealth = (health) => { characterBox.health = health; characterBox.updateStats(); }
  characterBox.getHealth = () => characterBox.health;
  characterBox.setMaxHealth = (maxHealth) => { characterBox.maxHealth = maxHealth; characterBox.updateStats(); }
  characterBox.getMaxHealth = () => characterBox.maxHealth;
  characterBox.setJuice = (juice) => { characterBox.juice = juice; characterBox.updateStats(); }
  characterBox.getJuice = () => characterBox.juice;
  characterBox.setMaxJuice = (maxJuice) => { characterBox.maxJuice = maxJuice; characterBox.updateStats(); }
  characterBox.getMaxJuice = () => characterBox.maxJuice;
  
  // Save parameters for access from the class
  characterBox.portrait = getPortrait();
  
  /* Force the character to be a certain emotion */
  /* Note that this will succeed as long as the portrait has a matching emotion sprite */
  characterBox.setEmotion = (emotion) => {
    // If there is no matching portrait for the character then it must mean that they cannot feel it
    checkIfImageExists(characterBox.portrait.replace("${emotion}", emotion), (exists) => {
      if (exists) {
        // Update emotion internally
        characterBox.emotion = emotion;
        
        // Change the background
        characterBox.setBackground("https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/bg_" + emotion + ".png");
        
        //Change character portrait and text at the top
        characterBox.setFace(characterBox.portrait.replace("${emotion}", emotion));
        characterBox.setEmotionImage("https://lilithdev.neocities.org/shrine/vg/omori/sprites/portrait/emotion_" + emotion + ".png");
      }
    });
  }
  characterBox.getEmotion = () => characterBox.emotion;
  
  /* Sets the background */
  characterBox.setBackground = (backgroundUrl) => {
    replaceImageIfExists(characterBox.nodes.altBg, backgroundUrl, () => {
      characterBox.nodes.altBg.classList.add("show");
        characterBox.nodes.altBg.onanimationend = () => {
          characterBox.nodes.altBg.classList.remove("show");
          characterBox.nodes.bg.src = characterBox.nodes.altBg.src;
        };
    });
  };
  
  /* Sets the face sprites */
  characterBox.setFace = (faceUrl) => {
    replaceImageIfExists(characterBox.nodes.face, faceUrl);
  };
  
  /* Sets the emotion sprites */
  characterBox.setEmotionImage = (emotionUrl) => {
    replaceImageIfExists(characterBox.nodes.emotion, emotionUrl);
  };
  
  /* Inflict a type of emotion (change to or go up one stage) */
  characterBox.makeSad = () => characterBox.inflict("sad");
  characterBox.makeAngry = () => characterBox.inflict("angry");
  characterBox.makeHappy = () => characterBox.inflict("happy");
  
  /* Inflict the type of emotion desired (sad angry happy) */
  characterBox.inflict = (type) => {
    if(characterBox.emotion in emotionList) {
      if(type in emotionList[characterBox.emotion]) {
        characterBox.setEmotion(emotionList[characterBox.emotion][type]);
      } else {
        characterBox.setEmotion(type);
      }
    }
  }
  
  /* Play hurt animation (test) */
  characterBox.hurt = (time) => {
    const newFace = characterBox.portrait.replace("${emotion}", "hurt");
    checkIfImageExists(newFace, (exists) => {
      if (exists) {
        characterBox.nodes.face.src = newFace;
        /*characterBox.health -= 5;
        characterBox.updateStats();*/
        setTimeout(() => characterBox.nodes.face.src = characterBox.portrait.replace("${emotion}", characterBox.emotion), time);
      }
    });
  };
  
  /* Put custom text in the health bar, set to null to go put numbers back */
  characterBox.setHealthText = (text) => {
    if(text !== null) {
      characterBox.nodes.healthText.innerText = text;
    } else {
      characterBox.nodes.healthText.innerText = characterBox.health + "/" + characterBox.maxHealth;
    }
  }
  
  /* Put custom text in the health bar, set to null to go put numbers back */
  characterBox.setJuiceText = (text) => {
    if(text !== null) {
      characterBox.nodes.juiceText.innerText = text;
    } else {
      characterBox.nodes.juiceText.innerText = characterBox.juice + "/" + characterBox.maxJuice;
    }
  }
  
  /* Put custom text in the emotion box, set to null to go back to normal */
  characterBox.setEmotionText = (text) => {
    if(text !== null) {
      characterBox.nodes.emotion.style.display = 'none';
      characterBox.nodes.emotionText.innerHTML = text;
    } else {
      characterBox.nodes.emotion.style.display = 'inherit';
      characterBox.nodes.emotionText.innerHTML = '';
    }
  }
  
  // Apply the emotion we've provided by default
  characterBox.setEmotion(document.currentScript.getAttribute('emotion') ? document.currentScript.getAttribute('emotion') : "neutral");
  
  // This is where you can start putting your own custom code
  // You can use any of the functions above, for example I'm making it so that clicking on the face plays the hurt animation
  //characterBox.nodes.face.onclick = () => characterBox.hurt();
}