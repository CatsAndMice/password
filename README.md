
[uTools 插件——密码管家](https://u.tools/plugins/detail/%E5%AF%86%E7%A0%81%E7%AE%A1%E5%AE%B6/?c=eylamc1n2u)

## uTools 插件截图
![1]([./images/3.png](https://i.111666.best/image/sgaFjkVkWmyX2D7gtRBj9o.png))
![2](https://i.111666.best/image/K1esrWWx84v7DCcF2ui3wx.png)
![3](https://i.111666.best/image/2L7yZSq5ugNu4u1VIy50Zf.png)

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
