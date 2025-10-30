import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('dart-scope-builder activated');

  const disposable = vscode.commands.registerCommand(
    'dart-scope-builder.runBuildRunner',
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showWarningMessage('请先选中一个文件或文件夹');
        return;
      }

      const targetPath = uri.fsPath;
      const isFile = !!path.extname(targetPath);
      const cwd = isFile ? path.dirname(targetPath) : targetPath;

      // 工作区路径（用于计算相对路径）
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      const relativePath = workspaceFolder
        ? path.relative(workspaceFolder.uri.fsPath, targetPath)
        : targetPath;

      let buildFilter: string;

      if (isFile) {
        // 如果是 Dart 文件，替换文件名为 *.dart
        if (targetPath.endsWith('.dart')) {
          const dir = path.dirname(relativePath);
          buildFilter = path.join(dir, '*.dart');
        } else {
          // 其他文件类型直接使用文件路径
          buildFilter = relativePath;
        }
      } else {
        // 如果是文件夹，加上 /*.dart
        buildFilter = path.join(relativePath, '*.dart');
      }

      const terminal = vscode.window.createTerminal({
        name: 'Dart Build Runner',
      });
      terminal.show();
      terminal.sendText(
        `dart run build_runner build --delete-conflicting-outputs --build-filter "${buildFilter}"`,
      );

      vscode.window.showInformationMessage(
        `正在执行 build_runner 于: ${cwd}\n过滤范围: ${buildFilter}`,
      );
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
