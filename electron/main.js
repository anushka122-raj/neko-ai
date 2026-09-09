const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  nativeImage,
  screen,
  Notification,
  shell,
} = require("electron");

const fs = require("fs");
const path = require("path");

const Store =
  require("electron-store").default;

const createPetWindow =
  require("./petWindow");

const FRONTEND_URL =
  process.env.VITE_DEV_SERVER_URL ||
  "http://localhost:5173";

const PET_WIDTH = 320;
const PET_HEIGHT = 320;

let mainWindow = null;
let petWindow = null;
let alarmWindow = null;
let tray = null;

let isQuitting = false;
let dragInterval = null;
let alarmWatcher = null;
let activeAlarm = null;

let dragOffset = {
  x: PET_WIDTH / 2,
  y: PET_HEIGHT / 2,
};

const boundsFile = path.join(
  app.getPath("userData"),
  "pet-bounds.json"
);

const alarmStore = new Store({
  name: "neko-alarms",
});

let alarms =
  alarmStore.get("alarms", []);

if (!Array.isArray(alarms)) {
  alarms = [];
}

/* MAIN WINDOW */

function createMainWindow() {
  if (
    mainWindow &&
    !mainWindow.isDestroyed()
  ) {
    mainWindow.show();
    mainWindow.restore();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 950,
    minHeight: 650,

    show: false,
    backgroundColor: "#0f192d",

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

  mainWindow.loadURL(`${FRONTEND_URL}/`);

  mainWindow.once(
    "ready-to-show",
    () => {
      mainWindow?.show();
    }
  );

  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* PET POSITION */

function getDefaultPetBounds() {
  const { workArea } =
    screen.getPrimaryDisplay();

  return {
    width: PET_WIDTH,
    height: PET_HEIGHT,

    x:
      workArea.x +
      workArea.width -
      PET_WIDTH -
      25,

    y:
      workArea.y +
      workArea.height -
      PET_HEIGHT -
      20,
  };
}

function readSavedPetBounds() {
  const defaults =
    getDefaultPetBounds();

  try {
    if (!fs.existsSync(boundsFile)) {
      return defaults;
    }

    const saved = JSON.parse(
      fs.readFileSync(
        boundsFile,
        "utf8"
      )
    );

    return {
      width: PET_WIDTH,
      height: PET_HEIGHT,

      x: Number.isFinite(saved?.x)
        ? Math.round(saved.x)
        : defaults.x,

      y: Number.isFinite(saved?.y)
        ? Math.round(saved.y)
        : defaults.y,
    };
  } catch (error) {
    console.error(error);
    return defaults;
  }
}

function savePetBounds() {
  if (
    !petWindow ||
    petWindow.isDestroyed()
  ) {
    return;
  }

  const [x, y] =
    petWindow.getPosition();

  fs.writeFileSync(
    boundsFile,
    JSON.stringify(
      {
        width: PET_WIDTH,
        height: PET_HEIGHT,
        x,
        y,
      },
      null,
      2
    ),
    "utf8"
  );
}

function getSafePetPosition(x, y) {
  const display =
    screen.getDisplayNearestPoint({
      x: Math.round(x),
      y: Math.round(y),
    });

  const area = display.workArea;

  const safeX = Math.max(
    area.x,
    Math.min(
      Math.round(x),
      area.x +
        area.width -
        PET_WIDTH
    )
  );

  const safeY = Math.max(
    area.y,
    Math.min(
      Math.round(y),
      area.y +
        area.height -
        PET_HEIGHT
    )
  );

  return {
    x: safeX,
    y: safeY,

    hitLeft: safeX <= area.x,

    hitRight:
      safeX >=
      area.x +
        area.width -
        PET_WIDTH,
  };
}

function movePetTo(x, y) {
  if (
    !petWindow ||
    petWindow.isDestroyed()
  ) {
    return null;
  }

  const position =
    getSafePetPosition(x, y);

  petWindow.setPosition(
    position.x,
    position.y,
    false
  );

  return position;
}

function movePetBy(deltaX, deltaY) {
  if (
    !petWindow ||
    petWindow.isDestroyed()
  ) {
    return null;
  }

  const [currentX, currentY] =
    petWindow.getPosition();

  return movePetTo(
    currentX +
      Number(deltaX || 0),

    currentY +
      Number(deltaY || 0)
  );
}

/* PET WINDOW */

function openPetWindow() {
  if (
    petWindow &&
    !petWindow.isDestroyed()
  ) {
    petWindow.showInactive();
    return;
  }

  petWindow = createPetWindow({
    url: FRONTEND_URL,
    bounds: readSavedPetBounds(),
    width: PET_WIDTH,
    height: PET_HEIGHT,
  });

  petWindow.on(
    "move",
    savePetBounds
  );

  petWindow.on("closed", () => {
    stopDragging();
    petWindow = null;
  });
}

function sendPetEvent(channel, value) {
  if (
    !petWindow ||
    petWindow.isDestroyed() ||
    petWindow.webContents.isDestroyed()
  ) {
    return;
  }

  petWindow.webContents.send(
    channel,
    value
  );
}

/* PET DRAGGING */

function startDragging(offset = {}) {
  if (
    !petWindow ||
    petWindow.isDestroyed()
  ) {
    return;
  }

  stopDragging();

  petWindow.setIgnoreMouseEvents(false);

  dragOffset = {
    x: Number.isFinite(offset.x)
      ? offset.x
      : PET_WIDTH / 2,

    y: Number.isFinite(offset.y)
      ? offset.y
      : PET_HEIGHT / 2,
  };

  dragInterval = setInterval(() => {
    if (
      !petWindow ||
      petWindow.isDestroyed()
    ) {
      stopDragging();
      return;
    }

    const cursor =
      screen.getCursorScreenPoint();

    movePetTo(
      cursor.x - dragOffset.x,
      cursor.y - dragOffset.y
    );
  }, 16);
}

function stopDragging() {
  if (dragInterval) {
    clearInterval(dragInterval);
    dragInterval = null;
  }

  savePetBounds();
}

/* ALARM STORAGE */

function saveAlarms() {
  alarmStore.set(
    "alarms",
    alarms
  );

  if (
    mainWindow &&
    !mainWindow.isDestroyed()
  ) {
    mainWindow.webContents.send(
      "alarms-updated",
      alarms
    );
  }
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(2, "0"),

    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}

function getMinuteKey(date) {
  return [
    getLocalDateKey(date),
    date.getHours(),
    date.getMinutes(),
  ].join("-");
}

function matchesRecurringDay(
  alarm,
  now
) {
  const day = now.getDay();

  if (alarm.repeat === "daily") {
    return true;
  }

  if (
    alarm.repeat === "weekdays"
  ) {
    return day >= 1 && day <= 5;
  }

  if (
    alarm.repeat === "weekends"
  ) {
    return day === 0 || day === 6;
  }

  if (
    alarm.repeat === "custom"
  ) {
    return (
      Array.isArray(alarm.days) &&
      alarm.days.includes(day)
    );
  }

  return false;
}

function shouldTriggerAlarm(
  alarm,
  now
) {
  if (!alarm?.enabled) {
    return false;
  }

  if (alarm.snoozeUntil) {
    const snoozeTime =
      new Date(alarm.snoozeUntil);

    const difference =
      now.getTime() -
      snoozeTime.getTime();

    return (
      difference >= 0 &&
      difference < 60_000
    );
  }

  if (!alarm.time) {
    return false;
  }

  const [hours, minutes] =
    alarm.time
      .split(":")
      .map(Number);

  if (
    now.getHours() !== hours ||
    now.getMinutes() !== minutes
  ) {
    return false;
  }

  if (alarm.repeat === "once") {
    return (
      alarm.date ===
      getLocalDateKey(now)
    );
  }

  return matchesRecurringDay(
    alarm,
    now
  );
}

/* ALARM POPUP */

function createAlarmWindow(alarm) {
  activeAlarm = alarm;

  if (
    alarmWindow &&
    !alarmWindow.isDestroyed()
  ) {
    alarmWindow.show();
    alarmWindow.focus();

    alarmWindow.webContents.send(
      "alarm-popup-data",
      alarm
    );

    return;
  }

  alarmWindow =
    new BrowserWindow({
      width: 600,
      height: 620,

      minWidth: 460,
      minHeight: 540,

      frame: false,
      resizable: false,
      maximizable: false,
      minimizable: false,

      alwaysOnTop: true,
      skipTaskbar: false,
      focusable: true,

      backgroundColor: "#090f1d",

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

  alarmWindow.setAlwaysOnTop(
    true,
    "screen-saver"
  );

  alarmWindow.loadURL(
    `${FRONTEND_URL}/alarm-ring`
  );

  alarmWindow.once(
    "ready-to-show",
    () => {
      alarmWindow.show();
      alarmWindow.focus();
    }
  );

  alarmWindow.webContents.on(
    "did-finish-load",
    () => {
      alarmWindow.webContents.send(
        "alarm-popup-data",
        alarm
      );
    }
  );

  alarmWindow.on("close", (event) => {
    if (
      activeAlarm &&
      !isQuitting
    ) {
      event.preventDefault();
      alarmWindow.focus();
    }
  });

  alarmWindow.on("closed", () => {
    alarmWindow = null;
  });
}

function closeAlarmWindow() {
  activeAlarm = null;

  if (
    alarmWindow &&
    !alarmWindow.isDestroyed()
  ) {
    alarmWindow.destroy();
    alarmWindow = null;
  }
}

function triggerAlarm(alarm) {
  openPetWindow();

  sendPetEvent(
    "pet-message",
    `HEY HUMAN! ${alarm.label} 😾`
  );

  sendPetEvent(
    "pet-emotion",
    "angry"
  );

  shell.beep();

  createAlarmWindow(alarm);

  if (
    Notification.isSupported()
  ) {
    const notification =
      new Notification({
        title:
          "🐱 NekoAI Alarm",

        body:
          `${alarm.label} — ` +
          "rise and grind, bestie.",

        urgency: "critical",
      });

    notification.on(
      "click",
      () => {
        createAlarmWindow(alarm);
      }
    );

    notification.show();
  }

  if (
    mainWindow &&
    !mainWindow.isDestroyed()
  ) {
    mainWindow.webContents.send(
      "alarm-fired",
      alarm
    );
  }
}

function checkAlarms() {
  const now = new Date();
  let changed = false;

  alarms = alarms.map(
    (alarm) => {
      if (
        !shouldTriggerAlarm(
          alarm,
          now
        )
      ) {
        return alarm;
      }

      const triggerKey =
        alarm.snoozeUntil
          ? `snooze-${alarm.snoozeUntil}`
          : `${alarm.id}-${getMinuteKey(now)}`;

      if (
        alarm.lastTriggeredKey ===
        triggerKey
      ) {
        return alarm;
      }

      triggerAlarm(alarm);
      changed = true;

      return {
        ...alarm,

        snoozeUntil: null,
        lastTriggeredKey:
          triggerKey,

        enabled:
          alarm.repeat === "once"
            ? false
            : alarm.enabled,
      };
    }
  );

  if (changed) {
    saveAlarms();
  }
}

function startAlarmWatcher() {
  if (alarmWatcher) {
    clearInterval(alarmWatcher);
  }

  checkAlarms();

  alarmWatcher = setInterval(
    checkAlarms,
    5000
  );
}

/* TRAY */

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(
    nativeImage.createEmpty()
  );

  tray.setToolTip("NekoAI");

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open NekoAI",
        click: createMainWindow,
      },

      {
        label: "Open Alarms",
        click: () => {
          createMainWindow();

          mainWindow.loadURL(
            `${FRONTEND_URL}/alarms`
          );
        },
      },

      {
        label: "Show Neko",
        click: openPetWindow,
      },

      {
        type: "separator",
      },

      {
        label: "Quit NekoAI",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );
}

/* PET IPC */

ipcMain.on(
  "pet-set-interactive",
  (_event, interactive) => {
    if (
      !petWindow ||
      petWindow.isDestroyed()
    ) {
      return;
    }

    petWindow.setIgnoreMouseEvents(
      !interactive,
      {
        forward: true,
      }
    );
  }
);

ipcMain.on(
  "pet-start-drag",
  (_event, offset) => {
    startDragging(offset);
  }
);

ipcMain.on(
  "pet-stop-drag",
  stopDragging
);

ipcMain.handle(
  "pet-move-by",
  (_event, movement = {}) => {
    return movePetBy(
      movement.x,
      movement.y
    );
  }
);

ipcMain.on(
  "pet-open-dashboard",
  createMainWindow
);

ipcMain.on("pet-hide", () => {
  petWindow?.hide();
});

ipcMain.on("pet-show", () => {
  openPetWindow();
});

ipcMain.on(
  "pet-save-position",
  savePetBounds
);

ipcMain.handle(
  "pet-get-screen-info",
  () => {
    if (
      !petWindow ||
      petWindow.isDestroyed()
    ) {
      return null;
    }

    const bounds =
      petWindow.getBounds();

    const display =
      screen.getDisplayMatching(
        bounds
      );

    return {
      windowBounds: bounds,
      workArea: display.workArea,
    };
  }
);

/* ALARM IPC */

ipcMain.handle(
  "alarms-get",
  () => alarms
);

ipcMain.handle(
  "alarms-save",
  (_event, alarm) => {
    alarms = [
      ...alarms.filter(
        (item) =>
          item.id !== alarm.id
      ),

      alarm,
    ];

    saveAlarms();
    return alarms;
  }
);

ipcMain.handle(
  "alarms-delete",
  (_event, alarmId) => {
    alarms = alarms.filter(
      (alarm) =>
        alarm.id !== alarmId
    );

    saveAlarms();
    return alarms;
  }
);

ipcMain.handle(
  "alarms-toggle",
  (
    _event,
    {
      alarmId,
      enabled,
    } = {}
  ) => {
    alarms = alarms.map(
      (alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              enabled:
                Boolean(enabled),
              lastTriggeredKey:
                null,
            }
          : alarm
    );

    saveAlarms();
    return alarms;
  }
);

ipcMain.handle(
  "alarms-snooze",
  (
    _event,
    {
      alarmId,
      minutes,
    } = {}
  ) => {
    const safeMinutes =
      Math.min(
        60,
        Math.max(
          1,
          Number(minutes) || 5
        )
      );

    const snoozeUntil =
      new Date(
        Date.now() +
          safeMinutes * 60_000
      ).toISOString();

    alarms = alarms.map(
      (alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              enabled: true,
              snoozeUntil,
              lastTriggeredKey:
                null,
            }
          : alarm
    );

    sendPetEvent(
      "pet-message",
      `Fine... ${safeMinutes} more minutes 😾`
    );

    sendPetEvent(
      "pet-emotion",
      "angry"
    );

    saveAlarms();
    closeAlarmWindow();

    return alarms;
  }
);

ipcMain.handle(
  "alarms-dismiss",
  (_event, alarmId) => {
    alarms = alarms.map(
      (alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              snoozeUntil: null,
              status: "completed",
              lastDismissedAt:
                new Date().toISOString(),
            }
          : alarm
    );

    const currentXp = Number(
      alarmStore.get(
        "alarmXp",
        0
      )
    );

    alarmStore.set(
      "alarmXp",
      currentXp + 20
    );

    sendPetEvent(
      "pet-message",
      "That's my human. +20 XP 😼✨"
    );

    sendPetEvent(
      "pet-emotion",
      "celebrate"
    );

    saveAlarms();
    closeAlarmWindow();

    return alarms;
  }
);

ipcMain.handle(
  "alarm-active-get",
  () => activeAlarm
);

ipcMain.on(
  "alarm-popup-close",
  closeAlarmWindow
);

/* APP */

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  createMainWindow();
  openPetWindow();
  createTray();
  startAlarmWatcher();
});

app.on("activate", () => {
  createMainWindow();
  openPetWindow();
});

app.on("before-quit", () => {
  isQuitting = true;

  stopDragging();
  savePetBounds();

  if (alarmWatcher) {
    clearInterval(alarmWatcher);
    alarmWatcher = null;
  }

  closeAlarmWindow();
});

app.on("window-all-closed", () => {
  // Keep alarms and pet alive.
});