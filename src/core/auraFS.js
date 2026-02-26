// src/core/auraFS.js

import JSZip from "jszip";

const DB_NAME = "AuraMobileDB_v2"; // version bump
const STORE_NAME = "projects";

let saveTimer = null; // debounce save

const AuraFS = {
  project: {
    id: null,
    name: null,
    type: null,
    root: []
  },

  // =============================
  // INIT
  // =============================
  async init() {
    const saved = await this.loadFromDB();

    if (saved) {
      this.project = saved;
    } else {
      this.project = {
        id: Date.now(),
        name: "my-project",
        type: "vanilla",
        root: []
      };
      await this.saveToDB();
    }

    return this.project;
  },

  // =============================
  // SAFE AI STRUCTURE PARSER
  // =============================
  async parseAIStructure(text) {
    if (!text.trim()) return;

    const lines = text.split("\n").filter(l => l.trim() !== "");

    // 🔴 IMPORTANT: do NOT destroy existing project name
    const newProject = {
      id: Date.now(),
      name: this.project.name || "my-project",
      type: "vanilla",
      root: []
    };

    const stack = [{ depth: -1, children: newProject.root }];

    lines.forEach(line => {
      const depth = line.search(/\w|(?:\.[a-zA-Z0-9]+)/);
      const cleanName = line.replace(/[├└│─|]/g, "").trim();
      if (!cleanName) return;

      const isFolder = cleanName.endsWith("/") || !cleanName.includes(".");
      const nodeName = cleanName.replace(/\/$/, "");

      const newNode = {
        id: this.generateId(),
        name: nodeName,
        type: isFolder ? "folder" : "file",
        ...(isFolder
          ? { children: [], isOpen: true }
          : { content: "", isOpen: false })
      };

      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(newNode);

      if (isFolder) {
        stack.push({ depth, children: newNode.children });
      }
    });

    this.project = newProject;
    await this.saveToDB();
    return this.project;
  },

  // =============================
  // FIND NODE
  // =============================
  findNode(id, list = this.project.root) {
    for (const node of list) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  },

  // =============================
  // ADD NODE
  // =============================
  addNode(parentId, name, type, content = "") {
    const newNode = {
      id: this.generateId(),
      name,
      type,
      ...(type === "file"
        ? { content, isOpen: false }
        : { children: [], isOpen: true })
    };

    if (!parentId) {
      this.project.root.push(newNode);
    } else {
      const parent = this.findNode(parentId);
      if (parent?.children) {
        parent.children.push(newNode);
        parent.isOpen = true;
      }
    }

    this.saveToDB();
    return newNode;
  },

  // =============================
  // DELETE
  // =============================
  deleteNode(id) {
    const recursiveDelete = (list) => {
      const idx = list.findIndex(n => n.id === id);
      if (idx > -1) {
        list.splice(idx, 1);
        return true;
      }
      for (const node of list) {
        if (node.children && recursiveDelete(node.children)) {
          return true;
        }
      }
      return false;
    };

    recursiveDelete(this.project.root);
    this.saveToDB();
  },

  // =============================
  // UPDATE FILE (DEBOUNCED SAVE)
  // =============================
  updateFile(id, content) {
    const node = this.findNode(id);
    if (!node || node.type !== "file") return;

    node.content = content;

    // debounce DB save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      this.saveToDB();
    }, 400);
  },

  // =============================
  // EXPORT ZIP (MEMORY SAFE)
  // =============================
  async downloadProject() {
    const zip = new JSZip();

    const addToZip = (folder, nodes) => {
      nodes.forEach(node => {
        if (node.type === "folder") {
          const newFolder = folder.folder(node.name);
          addToZip(newFolder, node.children);
        } else {
          folder.file(node.name, node.content || "");
        }
      });
    };

    addToZip(zip, this.project.root);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.project.name || "project"}.zip`;
    a.click();

    // 🔥 memory cleanup
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },

  // =============================
  // IndexedDB
  // =============================
  getDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async saveToDB() {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(this.project, "activeProject");
  },

  async loadFromDB() {
    const db = await this.getDB();
    return new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get("activeProject");
      req.onsuccess = () => resolve(req.result);
    });
  },

  generateId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 7)
    );
  }
};

export default AuraFS;
