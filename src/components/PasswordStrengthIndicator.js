import React, { useState, useEffect } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import zxcvbn from 'zxcvbn'
import Tooltip from '@mui/material/Tooltip'
import { SUGGESTION_TRANSLATIONS } from '../utils/const'
const safelyScore = 3,//密码强度安全
    somewhatScore = 2//密码强度一般
const PasswordStrengthIndicator = ({ password }) => {
    const [passwordStrength, setPasswordStrength] = useState({})
    const calculatePasswordStrength = (password) => {
        if (!password) return { score: 0, color: 'error', label: '' };
        const result = zxcvbn(password);
        const colors = ['error', 'warning', 'info', 'success', 'success'];
        const labels = ['非常弱', '弱', '中等', '强', '非常强'];

        if (result.score === 2 && result.feedback.suggestions.length === 0) {
            result.feedback.suggestions.push('建议增长密码长度')
        }

        return {
            score: result.score,
            color: colors[result.score],
            label: labels[result.score],
            feedback: result.feedback.suggestions?.map(s => SUGGESTION_TRANSLATIONS[s] || s) || []
        };
    }
    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(password))
    }, [password])

    if (passwordStrength.label && passwordStrength.score < safelyScore) {
        return (
            <Box className="mt-1 flex justify-end items-center gap-2">
                <Tooltip arrow placement="top" title={
                    (passwordStrength.feedback && passwordStrength.feedback.length > 0) ? (
                        <React.Fragment>
                            {passwordStrength.feedback?.map((f, index) => (
                                <div key={index} style={{ margin: '2px 0' }}>
                                    {f}
                                </div>
                            ))}
                        </React.Fragment>
                    ) : '无建议'
                }>
                    <div className='flex items-center cursor-pointer'>
                        {passwordStrength.score < somewhatScore ? (
                            <ErrorOutlineIcon className="text-red-500 !text-base" />
                        ) : passwordStrength.score < safelyScore ? (
                            <WarningAmberIcon className="text-yellow-500 !text-base" />
                        ) : (
                            <CheckCircleOutlineIcon className="text-green-500 !text-base" />
                        )}
                        <Typography variant='caption' className={`
                !font-medium
                !ml-1
                ${passwordStrength.score < somewhatScore ? 'text-red-500' :
                                passwordStrength.score < safelyScore ? 'text-yellow-500' : 'text-green-500'}
              `}>
                            {passwordStrength.score < somewhatScore ? '弱密码' :
                                passwordStrength.score < safelyScore ? '中等强度' : '强密码'}
                            {passwordStrength.score < safelyScore && ' (建议改进)'}
                        </Typography>
                    </div>
                </Tooltip>
            </Box>
        );
    }
    return (<></>)
};

export default PasswordStrengthIndicator;