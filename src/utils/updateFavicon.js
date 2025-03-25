import { getFavicon } from "./getFavicon"
export const updateFavicon = async (value, doc, decryptAccountDic, onUpdate) => {
    if (value) {
        try {
            const favicon = await getFavicon(value)
            if (favicon && decryptAccountDic[doc._id]) {
                doc.favicon = favicon
                if (!decryptAccountDic[doc._id].account) {
                    decryptAccountDic[doc._id].account = {}
                }
                decryptAccountDic[doc._id].account.favicon = favicon
                onUpdate(doc)
            }
        } catch (e) {
            if (doc.favicon || (decryptAccountDic[doc._id]?.account?.favicon)) {
                delete doc.favicon
                if (decryptAccountDic[doc._id]?.account) {
                    delete decryptAccountDic[doc._id].account.favicon
                }
                onUpdate(doc)
            }
        }
    } else {
        delete doc.favicon
        delete decryptAccountDic[doc._id].account.favicon
        onUpdate(doc)
    }
}
