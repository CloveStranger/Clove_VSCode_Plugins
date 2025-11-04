# Dart Scope Builder

一个 VS Code 扩展，用于在指定范围内运行 Dart `build_runner build` 命令。

## 功能

- 右键文件或文件夹，快速执行 `build_runner build` 命令
- 自动过滤指定范围内的文件
- 支持在文件资源管理器和编辑器右键菜单中使用

## 使用方法

1. 在文件资源管理器中右键点击文件或文件夹
2. 选择 "Dart: Run build_runner build" 菜单项
3. 扩展会自动在终端中执行 `dart run build_runner build --delete-conflicting-outputs --build-filter` 命令

## 要求

- Dart SDK 已安装并配置在 PATH 中
- 项目已配置 `build_runner` 依赖

## 发布说明

### 0.0.1

初始版本，支持在指定范围内运行 build_runner 命令。
