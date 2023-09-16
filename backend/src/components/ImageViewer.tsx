import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../assets/css/image-viewer.css'

const ImageViewer = (
    {
        title,
        currentIndex: ivCurentIndex,
        src,
        closeOnClickOutside,
        disableScroll,
        backgroundStyle,
        closeComponent,
        leftArrowComponent,
        rightArrowComponent,
        imageStyle,
        onClose
    }: {
        title?: string,
        currentIndex?: number,
        src: string[],
        closeOnClickOutside?: boolean,
        disableScroll?: boolean,
        backgroundStyle?: React.CSSProperties
        closeComponent?: React.ReactNode
        leftArrowComponent?: React.ReactNode
        rightArrowComponent?: React.ReactNode
        imageStyle?: React.CSSProperties
        onClose: () => void
    }) => {
    const [currentIndex, setCurrentIndex] = useState(ivCurentIndex ?? 0)
    const thumbnails = useMemo<(HTMLDivElement | null)[]>(() => [], [])

    const imageViewerRef = useRef<HTMLDivElement>(null)

    const scrollToThumbnail = (el: HTMLDivElement | null, index: number) => {
        if (el?.parentNode?.parentNode) {
            const parentNode = el.parentNode?.parentNode as HTMLDivElement
            if (index === 0) {
                parentNode.scrollLeft = 0
            } else {
                const offset = 15
                const elLeft = el.offsetLeft + el.offsetWidth + offset
                const elParentLeft = parentNode.offsetLeft + parentNode.offsetWidth

                // check if element not in view
                if (elLeft >= elParentLeft + parentNode.scrollLeft) {
                    parentNode.scrollLeft = elLeft - elParentLeft
                } else if (elLeft <= parentNode.offsetLeft + parentNode.scrollLeft) {
                    parentNode.scrollLeft = el.offsetLeft - parentNode.offsetLeft
                }
            }
        }
    }

    const changeImage = useCallback(
        (delta: 1 | -1) => {
            let nextIndex = (currentIndex + delta) % src.length
            if (nextIndex < 0) {
                nextIndex = src.length - 1
            }
            setCurrentIndex(nextIndex)

            if (src.length > 1) {
                const thumbnail = thumbnails[nextIndex]
                scrollToThumbnail(thumbnail, nextIndex)
            }
        },
        [currentIndex, thumbnails] // eslint-disable-line react-hooks/exhaustive-deps
    )

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!event.target || !closeOnClickOutside) {
                return
            }

            const checkId = 'id' in event.target && event.target.id === 'ReactSimpleImageViewer'

            if (checkId) {
                event.stopPropagation()
                onClose?.()
            }
        },
        [] // eslint-disable-line react-hooks/exhaustive-deps
    )

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            event.preventDefault()
            const key = event.key

            if (key === 'Escape') {
                onClose?.()
            }

            if (['ArrowLeft', 'h'].includes(key)) {
                changeImage(-1)
            }

            if (['ArrowRight', 'l'].includes(key)) {
                changeImage(1)
            }
        },
        [changeImage] // eslint-disable-line react-hooks/exhaustive-deps
    )

    const handleWheel = useCallback(
        (event: globalThis.WheelEvent) => {
            const deltaY = event.deltaY

            if (deltaY > 0) {
                changeImage(1)
            } else {
                changeImage(-1)
            }
        },
        [changeImage]
    )

    useEffect(() => {
        if (!disableScroll) {
            document.addEventListener('wheel', handleWheel)
        }

        return () => {
            if (!disableScroll) {
                document.removeEventListener('wheel', handleWheel)
            }
        }
    }, [handleWheel, disableScroll])

    useEffect(() => {
        imageViewerRef.current?.focus()
    }, [])

    return (
        <div
            id="ReactSimpleImageViewer"
            className="wrapper react-simple-image-viewer__modal"
            ref={imageViewerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            style={backgroundStyle}
        >
            <div className="popup">
                <span
                    className="close react-simple-image-viewer__close"
                    onClick={() => onClose?.()}
                >
                    {closeComponent || '×'}
                </span>

                {title && <span className="title">{title}</span>}

                {src.length > 1 && (
                    <span
                        className="navigation prev react-simple-image-viewer__previous"
                        onClick={() => changeImage(-1)}
                    >
                        {leftArrowComponent || '❮'}
                    </span>
                )}

                {src.length > 1 && (
                    <span
                        className="navigation next react-simple-image-viewer__next"
                        onClick={() => changeImage(1)}
                    >
                        {rightArrowComponent || '❯'}
                    </span>
                )}

                <div
                    className="iv-content react-simple-image-viewer__modal-iv-content"
                    onClick={handleClick}
                >
                    <div className="slide react-simple-image-viewer__slide">
                        <img className="image" src={src[currentIndex]} alt='' style={imageStyle} />
                    </div>
                </div>

                {
                    src.length > 0 &&
                    <div className="thumbnailsContainer">
                        <div className="thumbnails">
                            {src.map((src, index) => (
                                <div
                                    key={index}
                                    ref={el => thumbnails[index] = el}
                                    className={`thumbnail${currentIndex === index ? ' selected' : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    <img className="thumbnail" src={src} alt='' />
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default ImageViewer