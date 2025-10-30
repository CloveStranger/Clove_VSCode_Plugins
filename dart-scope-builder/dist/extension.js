"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
function activate(context) {
  console.log("dart-scope-builder activated");
  const disposable = vscode.commands.registerCommand(
    "dart-scope-builder.runBuildRunner",
    async (uri) => {
      if (!uri) {
        vscode.window.showWarningMessage("\u8BF7\u5148\u9009\u4E2D\u4E00\u4E2A\u6587\u4EF6\u6216\u6587\u4EF6\u5939");
        return;
      }
      const targetPath = uri.fsPath;
      const isFile = !!path.extname(targetPath);
      const cwd = isFile ? path.dirname(targetPath) : targetPath;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const relativePath = workspaceFolder ? path.relative(workspaceFolder.uri.fsPath, targetPath) : targetPath;
      let buildFilter;
      if (isFile) {
        if (targetPath.endsWith(".dart")) {
          const dir = path.dirname(relativePath);
          buildFilter = path.join(dir, "*.dart");
        } else {
          buildFilter = relativePath;
        }
      } else {
        buildFilter = path.join(relativePath, "*.dart");
      }
      const terminal = vscode.window.createTerminal({
        name: "Dart Build Runner"
      });
      terminal.show();
      terminal.sendText(
        `dart run build_runner build --delete-conflicting-outputs --build-filter "${buildFilter}"`
      );
      vscode.window.showInformationMessage(
        `\u6B63\u5728\u6267\u884C build_runner \u4E8E: ${cwd}
\u8FC7\u6EE4\u8303\u56F4: ${buildFilter}`
      );
    }
  );
  context.subscriptions.push(disposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
