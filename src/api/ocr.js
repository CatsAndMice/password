let controller = null
export let isAbort = false
export const recognizeTextFromImage = async (imageData, options = {}) => {
    controller = new AbortController()
    const signal = controller.signal
    isAbort = false
    const response = await fetch('https://tysbgpu.market.alicloudapi.com/api/predict/ocr_general', {
        method: 'POST',
        signal, // 添加signal支持取消
        headers: {
            // 'Authorization': `APPCODE ${process.env.AppCode}`,
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            image: imageData,
            configure: {
                output_prob: options.outputProb || true,
                output_keypoints: options.outputKeypoints || false,
                skip_detection: options.skipDetection || false,
                without_predicting_direction: options.withoutDirection || false
            }
        })
    });
    controller = null
    return await response.json();
}

export const cancelOCR = () => {
    if (controller) {
        controller.abort()
        isAbort = true
        controller = null
    }
}
