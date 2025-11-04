import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 检查目录中是否包含yaml文件（.yaml 或 .yml）
 */
function hasYamlFile(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
  } catch {
    return false;
  }
}

/**
 * 向上查找第一个包含yaml文件的目录
 */
function findYamlDirectory(startPath: string): string | null {
  let currentPath = startPath;
  const rootPath = path.parse(currentPath).root;

  while (currentPath !== rootPath) {
    if (hasYamlFile(currentPath)) {
      return currentPath;
    }
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }

  return null;
}

/**
 * 检查路径是否为文件夹
 */
function isDirectory(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

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
      let cwd: string;

      // 检测当前选中是否是文件夹
      if (isFile) {
        // 如果是文件，获取其所在目录
        const dirPath = path.dirname(targetPath);
        // 检查目录中是否有yaml文件
        if (hasYamlFile(dirPath)) {
          cwd = dirPath;
        } else {
          // 向上查找第一个包含yaml的目录
          const yamlDir = findYamlDirectory(dirPath);
          if (yamlDir) {
            cwd = yamlDir;
          } else {
            // 如果找不到，使用原目录
            cwd = dirPath;
          }
        }
      } else {
        // 如果是文件夹，检查是否真的是文件夹（通过文件系统）
        const isDir = isDirectory(targetPath);
        if (isDir) {
          // 检查目录中是否有yaml文件
          if (hasYamlFile(targetPath)) {
            cwd = targetPath;
          } else {
            // 向上查找第一个包含yaml的目录
            const yamlDir = findYamlDirectory(targetPath);
            if (yamlDir) {
              cwd = yamlDir;
            } else {
              // 如果找不到，使用原目录
              cwd = targetPath;
            }
          }
        } else {
          // 不是文件夹，使用原路径的目录
          cwd = path.dirname(targetPath);
        }
      }

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
        isTransient: true,
      });

      terminal.show();

      terminal.sendText(`cd "${cwd}"`);

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
