const {
  BrowserWindow,
  screen,
} = require("electron");

const path = require("path");

const FRONTEND_URL =
  process.env.VITE_DEV_SERVER_URL ||
  "http://localhost:5173";

function createPetWindow(options = {}) {
  const width = options.width || 320;
  const height = options.height || 320;

  const { workArea } =
    screen.getPrimaryDisplay();

  const savedBounds =
    options.bounds || {};

  const x = Number.isFinite(
    savedBounds.x
  )
    ? savedBounds.x
    : workArea.x +
      workArea.width -
      width -
      25;

  const y = Number.isFinite(
    savedBounds.y
  )
    ? savedBounds.y
    : workArea.y +
      workArea.height -
      height -
      20;

  const petWindow = new BrowserWindow({
    width,
    height,
    x,
    y,

    frame: false,
    transparent: true,
    backgroundColor: "#00000000",

    resizable: false,

    // Native Electron dragging.
    movable: true,

    minimizable: false,
    maximizable: false,
    fullscreenable: false,

    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    show: false,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.js"
      ),

      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  petWindow.setAlwaysOnTop(
    true,
    "screen-saver"
  );

  petWindow.setVisibleOnAllWorkspaces(
    true,
    {
      visibleOnFullScreen: true,
    }
  );

  // Transparent area starts as click-through.
  petWindow.setIgnoreMouseEvents(
    true,
    {
      forward: true,
    }
  );

  const petURL =
    `${options.url || FRONTEND_URL}/pet`;

  console.log(
    "Loading floating pet:",
    petURL
  );

  petWindow.loadURL(petURL);

  petWindow.once(
    "ready-to-show",
    () => {
      petWindow.showInactive();
    }
  );

  return petWindow;
}

module.exports = createPetWindow;