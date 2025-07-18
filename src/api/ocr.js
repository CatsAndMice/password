// https://tysbgpu.market.alicloudapi.com/api/predict/ocr_general


export const recognizeTextFromImage = async (imageData, options = {}) => {
    const response = await fetch('https://tysbgpu.market.alicloudapi.com/api/predict/ocr_general', {
        method: 'POST',
        headers: {
            'Authorization': `APPCODE ${process.env.AppCode}`,
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
    return await response.json();
}

// curl -i -k -X POST 'https://tysbgpu.market.alicloudapi.com/api/predict/ocr_general'  -H 'Authorization:APPCODE 你自己的AppCode' --data '{
//     "image":    "图片二进制数据的base64编码/图片url"，
//     "configure": 
//         {
//             "output_prob" : true,               # 
//             "output_keypoints": false,          #是否输出文字框角点 
//             "skip_detection": false,             #是否跳过文字检测步骤直接进行文字识别
//             "without_predicting_direction": false   #是否关闭文字行方向预测
//         }
// }' -H 'Content-Type:application/json; charset=UTF-8'

//根据API的要求，定义相对应的Content-Type