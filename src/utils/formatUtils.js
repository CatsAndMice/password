/**
 * 格式化日期为本地字符串
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @param {boolean} showTime 是否显示时间
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateStr, showTime = false) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(showTime ? {
            hour: '2-digit',
            minute: '2-digit'
        } : {})
    })
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}