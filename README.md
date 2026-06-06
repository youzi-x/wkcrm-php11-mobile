# wkcrm-php11-mobile

悟空 CRM 11 PHP 版二开移动端 uni-app 项目，主要用于补充和适配悟空 CRM 手机端使用场景。

> 说明：本仓库为个人二次开发项目，非悟空 CRM 官方仓库。开源前已与悟空 CRM 官方人员沟通确认可以开源，项目用于移动端功能开发、演示、交流，以及后续提交给官方 fork 或协作参考。

## 项目说明

本仓库是悟空 CRM 11 PHP 版的移动端 uni-app 二开项目，当前仓库根目录即为移动端源码目录。

项目可配合已部署的悟空 CRM PHP 11 后端使用。实际部署时，可根据服务器目录结构，将本移动端项目放入悟空 CRM 部署目录中的对应位置，或构建 H5 后发布到指定访问目录。

## 官方链接

- 悟空 CRM 官网：https://www.72crm.com/
- 悟空 CRM GitHub 开源组织：https://github.com/WuKongOpenSource
- 悟空 CRM 11.0 PHP 版后端源码：https://gitee.com/wukongcrm/crm_php
- 悟空 CRM 11.0 PHP 版前端源码：https://gitee.com/wukongcrm/P72crm_web

## 主要功能

- 移动端登录与基础鉴权
- 工作台首页
- 线索管理
- 客户管理
- 联系人管理
- 商机管理
- 合同管理
- 回款管理
- 日程管理
- 项目模块
- 个人中心
- CRM 动态表单与通用列表组件
- H5 端构建与部署配置

## 技术栈

- uni-app
- Vue 3
- Vite
- JavaScript
- SCSS

后端接口基于悟空 CRM 11 PHP 版，主要技术栈为 PHP、ThinkPHP 5、MySQL、Redis。

## 目录结构

```text
.
├── api/                    # 接口封装
├── components/             # 通用组件
├── pages/                  # 页面模块
├── static/                 # 静态资源
├── store/                  # 状态管理
├── utils/                  # 工具方法
├── App.vue                 # 应用入口组件
├── index.html              # H5 入口
├── main.js                 # 应用入口脚本
├── manifest.json           # uni-app 应用配置
├── pages.json              # 页面与路由配置
├── package.json            # 前端依赖与脚本
├── uni.scss                # 全局样式变量
└── vite.config.js          # Vite 配置
```

## 本地运行

安装依赖：

```bash
npm install
```

启动 H5 开发环境：

```bash
npm run dev:h5
```

构建 H5：

```bash
npm run build:h5
```

## 接口配置

接口请求和基础配置主要在以下目录或文件中：

```text
api/
utils/request.js
utils/config.js
```

部署到不同环境时，请根据实际域名、接口地址和跨域策略调整相关配置。

## 上传 GitHub 注意事项

如果通过 GitHub 网页拖拽上传，建议上传源码文件，不建议上传依赖、缓存和构建产物。

建议不要上传：

```text
node_modules/
dist/
unpackage/
.hbuilderx/
.env
*.log
```

建议确认已经上传：

```text
api/
components/
pages/
static/
store/
utils/
App.vue
main.js
manifest.json
pages.json
package.json
vite.config.js
```

其中 `pages/`、`utils/`、`api/` 等目录是移动端源码的重要组成部分，缺少后项目可能无法正常运行或构建。

## 仓库描述建议

```text
悟空CRM PHP 11 二开移动端 uni-app 项目，包含手机端页面、接口适配和业务功能调整。
```

## 版权说明

本项目基于悟空 CRM 开源版本进行二次开发。原项目版权归原作者及相关权利方所有，二开部分仅用于学习、交流和项目适配。使用、传播或二次开发时，请同时遵守原项目开源协议和相关版权声明。
