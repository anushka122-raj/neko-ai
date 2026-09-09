const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
  "electronAPI",
  {
    setPetInteractive(interactive) {
      ipcRenderer.send(
        "pet-set-interactive",
        Boolean(interactive)
      );
    },

    startPetDrag(offset) {
      ipcRenderer.send(
        "pet-start-drag",
        offset
      );
    },

    stopPetDrag() {
      ipcRenderer.send("pet-stop-drag");
    },

    movePetBy(x, y) {
      return ipcRenderer.invoke(
        "pet-move-by",
        {
          x,
          y,
        }
      );
    },

    openDashboard() {
      ipcRenderer.send(
        "pet-open-dashboard"
      );
    },

    hidePet() {
      ipcRenderer.send("pet-hide");
    },

    showPet() {
      ipcRenderer.send("pet-show");
    },

    savePetPosition() {
      ipcRenderer.send(
        "pet-save-position"
      );
    },

    getPetScreenInfo() {
      return ipcRenderer.invoke(
        "pet-get-screen-info"
      );
    },

    onPetMessage(callback) {
      const listener = (_event, message) => {
        callback(message);
      };

      ipcRenderer.on(
        "pet-message",
        listener
      );

      return () => {
        ipcRenderer.removeListener(
          "pet-message",
          listener
        );
      };
    },

    onPetEmotion(callback) {
      const listener = (_event, emotion) => {
        callback(emotion);
      };

      ipcRenderer.on(
        "pet-emotion",
        listener
      );

      return () => {
        ipcRenderer.removeListener(
          "pet-emotion",
          listener
        );
      };
    },

    getAlarms() {
      return ipcRenderer.invoke(
        "alarms-get"
      );
    },

    saveAlarm(alarm) {
      return ipcRenderer.invoke(
        "alarms-save",
        alarm
      );
    },

    deleteAlarm(alarmId) {
      return ipcRenderer.invoke(
        "alarms-delete",
        alarmId
      );
    },

    toggleAlarm(alarmId, enabled) {
      return ipcRenderer.invoke(
        "alarms-toggle",
        {
          alarmId,
          enabled,
        }
      );
    },

    snoozeAlarm(alarmId, minutes) {
      return ipcRenderer.invoke(
        "alarms-snooze",
        {
          alarmId,
          minutes,
        }
      );
    },

    dismissAlarm(alarmId) {
      return ipcRenderer.invoke(
        "alarms-dismiss",
        alarmId
      );
    },

    getActiveAlarm() {
      return ipcRenderer.invoke(
        "alarm-active-get"
      );
    },

    closeAlarmPopup() {
      ipcRenderer.send(
        "alarm-popup-close"
      );
    },

    onAlarmFired(callback) {
      const listener = (_event, alarm) => {
        callback(alarm);
      };

      ipcRenderer.on(
        "alarm-fired",
        listener
      );

      return () => {
        ipcRenderer.removeListener(
          "alarm-fired",
          listener
        );
      };
    },

    onAlarmPopupData(callback) {
      const listener = (_event, alarm) => {
        callback(alarm);
      };

      ipcRenderer.on(
        "alarm-popup-data",
        listener
      );

      return () => {
        ipcRenderer.removeListener(
          "alarm-popup-data",
          listener
        );
      };
    },
  }
);