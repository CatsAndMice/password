class CSVParser {
    // 检测浏览器格式
    static detectBrowserFormat(headers) {
        // Edge 格式
        if (headers.includes('url') && headers.includes('username') && headers.includes('password')) {
            return {
                type: 'edge',
                urlIndex: headers.indexOf('url'),
                usernameIndex: headers.indexOf('username'),
                passwordIndex: headers.indexOf('password'),
                nameIndex: headers.indexOf('name'),
                noteIndex: headers.indexOf('note')
            }
        }
        // Chrome 格式
        if (headers.includes('name') && headers.includes('url') && headers.includes('username') && headers.includes('password')) {
            return {
                type: 'chrome',
                urlIndex: headers.indexOf('url'),
                usernameIndex: headers.indexOf('username'),
                passwordIndex: headers.indexOf('password'),
                nameIndex: headers.indexOf('name'),
                noteIndex: headers.indexOf('note')
            }
        }
        return null
    }

    // 处理 CSV 行分割（考虑引号内的逗号）
    static splitCSVLine(line) {
        const values = []
        let inQuotes = false
        let currentValue = ''

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim())
                currentValue = ''
            } else {
                currentValue += char
            }
        }
        values.push(currentValue.trim())
        return values
    }

    // 从 CSV 数据创建账号对象
    static createAccountFromCSV(values, format) {
        if (!format || values.length < 3) return null

        return {
            title: values[format.nameIndex] || values[format.urlIndex] || '未命名账号',
            username: values[format.usernameIndex] || '',
            password: values[format.passwordIndex] || '',
            link: values[format.urlIndex] || '',
            remark: values[format.noteIndex] || ''
        }
    }

    // 解析 CSV 内容
    static parseCSV(content) {
        const accounts = []
        const lines = content.split('\n')
        if (lines.length < 2) return accounts

        const headers = this.splitCSVLine(lines[0])
        const format = this.detectBrowserFormat(headers)
        if (!format) return accounts

        lines.slice(1).forEach(line => {
            if (!line.trim()) return
            const values = this.splitCSVLine(line)
            const account = this.createAccountFromCSV(values, format)
            if (account) accounts.push(account)
        })

        return accounts
    }

    // 将账号数据转换为文本格式
    static convertToText(accounts) {
        return accounts.map(account => {
            return `【${account.title}】\n` +
                   `用户名：${account.username}\n` +
                   `密码：${account.password}\n` +
                   `链接：${account.link}\n` +
                   `说明：${account.remark}`
        }).join('\n\n')
    }
}

export default CSVParser