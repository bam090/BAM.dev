"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "bamJava",
  Object.freeze({
    capabilities: () => ipcRenderer.invoke("bam-java:capabilities"),
    run: (request) => ipcRenderer.invoke("bam-java:run", request),
    cancel: (request) => ipcRenderer.invoke("bam-java:cancel", request),
  }),
);
