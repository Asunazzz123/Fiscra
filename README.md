# Fiscra 
Fiscra 是一个记账小程序，基于React与Python开发
目前还是demo版本~

[中文](README.md) | [English](README_EN.md)
## 部署说明
请先预先安装 [Node.js](https://nodejs.org/en/download), [Python](https://www.python.org/downloads/)
- 运行 `make setup` 进行前端与后端的依赖的安装
- 运行 `make run` 一键部署前端与后端
- 运行 `make kill SERVICE=frontend` 杀死前端服务
- 运行 `make kill SERVICE=backend` 杀死前端服务
- 运行 `make kill` 同时杀死前后端的服务
- 在根目录创建`.env.local`文件并配置`GEMINI_APT_KEY`以使用AI服务