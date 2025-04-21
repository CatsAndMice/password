
[uTools 插件——密码管家](https://u.tools/plugins/detail/%E5%AF%86%E7%A0%81%E7%AE%A1%E5%AE%B6/?c=eylamc1n2u)

## 功能清单
- [x] 账号分组管理（支持拖拽排序、层级调整）
- [x] 账号信息加密存储与管理（添加、编辑、删除、排序）
- [x] 常用账号自动统计
- [x] 全局搜索与分组筛选
- [x] 随机密码生成器
- [x] 本地备份与恢复
- [x] WebDAV 云备份与恢复
- [x] 明暗主题切换（亮色/暗色/跟随系统）
- [x] 数据加密存储（BCrypt + AES-256-CBC）
- [x] 快捷键支持（复制用户名/密码、新增账号等）
- [x] 拖拽操作（账号、分组均支持）

## uTools 插件截图
<img width="912" alt="截屏2025-04-15 17 36 22" src="https://github.com/user-attachments/assets/4fafb61d-0eb4-4a2d-b4a8-fe5e6cdbb5bb" />
<img width="912" alt="截屏2025-04-15 17 36 47" src="https://github.com/user-attachments/assets/9e4ccf9e-27ba-46ee-b96f-d339101b169f" />
<img width="912" alt="截屏2025-04-15 17 36 59" src="https://github.com/user-attachments/assets/13c91831-29d2-4079-af7d-08eeceb57d6a" />

## 运行
```
npm install
```
```
npm run build
```
**uTools 开发者工具** 中将 `dist/plugin.json` 加入到本地开发

### 引用的 bcrypt 库
https://github.com/kelektiv/node.bcrypt.js

## 数据安全
1. 开门密码经 BCrypt 加密存储，保障密码安全。
2. 帐号信息加密存储，采用 aes-256-cbc 算法，加密秘钥由开门密码哈希处理生成。
3. 无开门密码，加密信息无法破解。

## 数据存储与备份说明
1. 本地存储：数据默认存储于本地 uTools 内置版本数据库，确保数据安全。
2. 云端同步：若开启 "uTools 帐号与数据" 云端备份及多端同步，数据将同步至云端。
3. 本地备份：支持自动备份至用户本地指定位置，用户可自由选择备份路径；若未指定，则默认使用系统预设位置，保障数据备份的灵活性与便捷性。

## 找回密码
1. 忘记密码可找回，仅提示前三位，后三位需用户回忆。
2. 若无法回忆，需格式化插件数据：进入 “uTools 帐号与数据”，找到 “密码官家” 插件文档，进行格式化。

## 使用技巧
1. 帐号可拖动排序、可拖动到左侧分组直接变更分组
2. 分组可拖动变更层级关系
3. 快捷键 Command/Ctrl + U 复制当前帐号用户名
4. 快捷键 Command/Ctrl + P 复制当前帐号密码
4. 快捷键 Command/Ctrl + N 新增帐号

## Star History
[![Star History Chart](https://api.star-history.com/svg?repos=CatsAndMice/password&type=Date)](https://star-history.com/#CatsAndMice/password&Date)