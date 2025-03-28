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
        const DATABASE_ID = '3463f342-aa58-4d5e-9166-37e26c5a10ae',
            ACCOUNT_ID = 'f2865efc51b5e31e84a5135d4dab809a'
        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer biAt1nwwtTpFiq27-tRLoBqC2dzlCpOMcqdMwztE',
                    'Content-Type': 'application/json',
                    'X-Auth-Key': `625677219503ba745caaacacccaf574282bf4`,
                    'X-Auth-Email': 'li13034833806@gmail.com'
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
        try {
            const { message } = eventData
            const user_id = await this.getUserId()
            if (!user_id) return

            await this.query(
                `INSERT INTO events (user_id, message) VALUES (?, ?)`,
                [user_id, JSON.stringify(message)]
            ).catch(() => {})  // 忽略查询错误
            
        } catch (error) {
            console.error('埋点记录失败:', error)
            // 静默失败，不影响主程序
        }
    },

    // 批量写入埋点数据
    // async batchTrackEvents(events) {
    //     const user_id = await this.getUserId()
    //     if (!user_id) return null

    //     const statements = events.map(event => ({
    //         sql: `INSERT INTO events (user_id, message) VALUES (?, ?)`,
    //         params: [
    //             user_id,
    //             JSON.stringify(event.message)
    //         ]
    //     }))

    //     return this.batchQuery(statements)
    // }
}

export default D1API