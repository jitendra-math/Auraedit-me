// src/core/auraFS.js
import JSZip from "jszip";

const DB_NAME = "AuraMobileDB_v2";
const STORE_NAME = "projects";

let dbPromise = null;

const AuraFS = {
  project: null,

  // ================= INIT =================
  async init() {
    const saved = await this.loadFromDB();

    if (saved && saved.root) {
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

  // ================= AI STRUCTURE =================
  async parseAIStructure(text) {
    const lines = text.split("\n").filter(l => l.trim());

    this.project.root = [];

    const stack = [{ depth: -1, children: this.project.root }];

    lines.forEach(line => {
      const depth = line.search(/\w/);
      const clean = line.replace(/[├└│─]/g, "").trim();
      if (!clean) return;

      const isFolder = clean.endsWith("/") || !clean.includes(".");
      const name = clean.replace("/", "");

      const node = {
        id: this.id(),
        name,
        type: isFolder ? "folder" : "file",
        ...(isFolder
          ? { children: [], isOpen: true }
          : { content: `// ${name}`, isOpen: false })
      };

      while (stack.length > 1 && stack.at(-1).depth >= depth) stack.pop();
      stack.at(-1).children.push(node);

      if (isFolder) stack.push({ depth, children: node.children });
    });

    await this.saveToDB();
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  },

  // ================= CRUD =================
  findNode(id, list = this.project.root) {
    for (const n of list) {
      if (n.id === id) return n;
      if (n.children) {
        const f = this.findNode(id, n.children);
        if (f) return f;
      }
    }
  },

  addNode(parentId, name, type, content = "") {
    const node = {
      id: this.id(),
      name,
      type,
      ...(type === "file"
        ? { content, isOpen: false }
        : { children: [], isOpen: true })
    };

    if (!parentId) this.project.root.push(node);
    else {
      const parent = this.findNode(parentId);
      if (parent?.children) parent.children.push(node);
    }

    this.saveToDB();
    window.dispatchEvent(new CustomEvent("refresh-tree"));
    return node;
  },

  deleteNode(id) {
    const remove = (list) => {
      const i = list.findIndex(n => n.id === id);
      if (i > -1) return list.splice(i,1);

      list.forEach(n => n.children && remove(n.children));
    };

    remove(this.project.root);
    this.saveToDB();
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  },

  updateFile(id, content) {
    const node = this.findNode(id);
    if (!node) return;
    node.content = content;
    this.saveToDB();
  },

  // ================= ZIP =================
  async downloadProject() {
    const zip = new JSZip();

    const walk = (folder, nodes) => {
      nodes.forEach(n => {
        if (n.type === "folder") {
          const f = folder.folder(n.name);
          walk(f, n.children);
        } else folder.file(n.name, n.content || "");
      });
    };

    walk(zip, this.project.root);

    const blob = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.project.name}.zip`;
    a.click();

    URL.revokeObjectURL(url);
  },

  // ================= DB =================
  async db() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((res, rej)=>{
      const req = indexedDB.open(DB_NAME,1);

      req.onupgradeneeded = e=>{
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE_NAME))
          db.createObjectStore(STORE_NAME);
      };

      req.onsuccess = ()=>res(req.result);
      req.onerror = ()=>rej(req.error);
    });

    return dbPromise;
  },

  async saveToDB() {
    if(!this.project) return;
    const db = await this.db();
    const tx = db.transaction(STORE_NAME,"readwrite");
    tx.objectStore(STORE_NAME).put(this.project,"active");
  },

  async loadFromDB() {
    const db = await this.db();
    return new Promise(r=>{
      const tx = db.transaction(STORE_NAME,"readonly");
      const req = tx.objectStore(STORE_NAME).get("active");
      req.onsuccess = ()=>r(req.result);
      req.onerror = ()=>r(null);
    });
  },

  id(){
    return Math.random().toString(36).slice(2);
  }
};

export default AuraFS;
