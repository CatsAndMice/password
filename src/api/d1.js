const D1API = {
    // 获取或生成用户ID
    async getUserId() {
        const userDoc = window.utools.db.get('system/user_id')
        if (userDoc) {
            return userDoc.userId
        }

        const newUserId = window.services.generateId('user_id')
        const result = window.utools.db.put({
            _id: 'system/user_id',
            userId: newUserId,
            createTime: Date.now()
        })

        return result.ok ? newUserId : null
    },

    async query(sql, params = []) {
        const DATABASE_ID = process.env.D1_DATABASE_ID,
            ACCOUNT_ID = process.env.D1_ACCOUNT_ID
        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.D1_AUTH_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Auth-Key': process.env.D1_AUTH_KEY,
                    'X-Auth-Email': process.env.D1_AUTH_EMAIL
                },
                body: JSON.stringify({
                    sql,
                    params
                })
            })

            const data = await response.json()
            if (!data.success) {
                console.error('插入失败:', data.errors)
                return null
            }
            return data.result
        } catch (error) {
            console.error('API请求失败:', error)
            return null
        }
    },

    // 写入埋点数据
    async trackEvent(eventData) {
        if (window.utools.isDev()) return
        try {
            const { message } = eventData
            const user_id = await this.getUserId()
            // user_id1743406254687_9f7ab182 为正式环境开发人员ID
            if (!user_id || user_id === 'user_id1743406254687_9f7ab182') return

            await this.query(
                `INSERT INTO events (user_id, message) VALUES (?, ?)`,
                [user_id, JSON.stringify(message)]
            ).catch(() => { })  // 忽略查询错误

        } catch (error) {
            console.error('埋点记录失败:', error)
            // 静默失败，不影响主程序
        }
    },
}

export default D1API