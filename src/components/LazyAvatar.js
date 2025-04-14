import React, { useRef, useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import LinkIcon from '@mui/icons-material/Link'

const LazyAvatar = ({ src, alt }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const avatarRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        if (avatarRef.current) {
            observer.observe(avatarRef.current)
        }

        return () => {
            if (observer) {
                observer.disconnect()
            }
        }
    }, [])

    const handleLoad = () => {
        setIsLoaded(true)
    }

    const handleError = () => {
        setHasError(true)
    }

    return (
        <div ref={avatarRef}>
            {isVisible && src && !hasError && (
                <Avatar
                    src={src}
                    alt={alt}
                    variant="square"
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        marginRight: '12px',
                        display: isLoaded ? 'flex' : 'none'
                    }}
                    onError={handleError}
                    onLoad={handleLoad}
                >
                    <LinkIcon sx={{ fontSize: 18, color: 'rgba(44, 62, 80, 0.5)' }} />
                </Avatar>
            )
            }
        </div>
    )
}

export default LazyAvatar