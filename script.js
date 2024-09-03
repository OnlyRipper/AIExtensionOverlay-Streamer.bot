const ADDRESS = "127.0.0.1"; // IP of SB instance
const PORT = "8080"; // Port of SB instance
const ENDPOINT = "/"; // Endpoint of SB instance
const WEBSOCKET_URI = `ws://${ADDRESS}:${PORT}${ENDPOINT}`;
const EVENT_LISTENER_NAMEID = "Typing Text"; // Custom event listener ID

const ws = new WebSocket(WEBSOCKET_URI);

// Global variables to store arguments
let actionName = "{AI} Streamer.bot AI"
let parentName = "{Websocket} Main Trigger"
let done = false;


function setupWebSocket() {
  console.log("Attempting to connect to Streamer.bot...");

  ws.addEventListener("open", (event) => {
    console.log("Connected to Streamer.bot");

    // Subscribe to events within Streamer.bot
    ws.send(
      JSON.stringify({
        request: "Subscribe",
        id: EVENT_LISTENER_NAMEID,
        events: {
          Raw: ["Action", "SubAction"], 
        },
      })
    );
  });

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  });
}

function handleWebSocketMessages() {
  ws.addEventListener("message", (event) => {
    if (!event.data) return;

    const jsonData = JSON.parse(event.data);

    if (jsonData.id === EVENT_LISTENER_NAMEID) return;
    if (jsonData.id === "DoAction") return;

    const argumentsData = jsonData.data.arguments;
    
    if (argumentsData && jsonData.data.parentName === parentName) {
      console.log("ARGS: ", jsonData);
      // console.log("ARGS: ", jsonData);

      let args = jsonData.data.arguments;

      console.log("name", jsonData.data.name);

      const pic = args.targetUserProfileImageUrl;
      const user = args.userName;
      const text = args.rawInput;
      // console.log("ARGS here");
      console.log("took args: ", pic, user, text);
      typeOut(pic, user, text)
    }});

    function typeOut(pic, user, text) {
      function startTypingAnimation() {
        const textElement = document.getElementById('text');
        const userNameElement = document.getElementById('userName');
        const backgroundImage = document.getElementById('background');
        const placeholderImage = document.getElementById('placeholder');
        const animationElement = document.querySelector('.animation');
    
        const typingSpeed = 62; // Adjust the typing speed in milliseconds
    
        placeholderImage.src = pic;
        userNameElement.innerHTML = user;
    
        function typeText(text, element, speed, callback) {
          let index = 0;
    
          function type() {
            if (index < text.length) {
              element.innerHTML += text.charAt(index);
              index++;
              setTimeout(type, speed);
            } else {
              if (callback) callback();
            }
          }
          type();
        }
    
        setTimeout(() => {
          animationElement.style.left = '0';
        }, 500); // 500ms before sliding in
    
        setTimeout(() => {
          backgroundImage.style.left = '0';
          placeholderImage.style.left = 'calc(100% - 60px)';
        }, 1000); // 1000ms after sliding in animation container
    
        setTimeout(() => {
          typeText(text, textElement, typingSpeed, function() {
            setTimeout(() => {
              animationElement.style.left = '-100%';
              done = true;
              back(done);
            }, 6000); // 2 seconds delay after text is fully typed out
          });
          textElement.classList.add('typing');
        }, 2000); // 1500ms to match the image slide + delay
      }
    
      // Check if the document is already loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTypingAnimation);
      } else {
        startTypingAnimation(); 
      }
    }
    
    function back(done) {
      ws.send(JSON.stringify({
        request: 'DoAction',
        id: 'DoAction',
        action: {
            name: actionName,
        },
        args: {
          done: done,
        },
      }));
    }
    
  }
  setupWebSocket();
  handleWebSocketMessages();