import gsap from 'gsap'
import { useCallback, useEffect, useRef } from 'react'
import { throttle } from 'throttle-debounce'

const getImageUrl = (i: number) => {
  return new URL(`/src/assets/img/${i}.jpeg`, import.meta.url).href
}

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

const App = () => {
  const requestRef = useRef<number>(0)
  const imagesContainerRef = useRef<HTMLDivElement>(null)

  const cacheMousePos = useRef({ x: 0, y: 0 })
  const mousePos = useRef({ x: 0, y: 0 })
  const lastImagePosition = useRef({ x: 0, y: 0 })

  const setCachedMousePosition = useCallback(() => {
    cacheMousePos.current.x = lerp(
      cacheMousePos.current.x || mousePos.current.x,
      mousePos.current.x,
      0.1
    )
    cacheMousePos.current.y = lerp(
      cacheMousePos.current.y || mousePos.current.y,
      mousePos.current.y,
      0.1
    )
    requestRef.current = requestAnimationFrame(setCachedMousePosition)
  }, [requestRef])

  useEffect(() => {
    const imagesContainer = imagesContainerRef.current!
    let i = 0

    const addImage = (x: number, y: number) => {
      const imgSrc = getImageUrl(i % 8)
      const img = new Image()
      img.src = imgSrc
      img.onload = () => {
        const image = document.createElement('img')
        image.src = imgSrc
        imagesContainer.appendChild(image)
        gsap.fromTo(
          image,
          {
            x: cacheMousePos.current.x,
            y: cacheMousePos.current.y
          },
          {
            duration: 2,
            x,
            y,
            ease: 'power4',
            onStart: () => {
              if (imagesContainer.contains(image)) {
                gsap.to(image, {
                  duration: 0.5,
                  opacity: 0,
                  delay: 1,
                  ease: 'power4.out',
                  onComplete: () => {
                    if (imagesContainer.contains(image)) {
                      imagesContainer.removeChild(image)
                    }
                  }
                })
              }
            }
          }
        )
      }
    }

    const handleMouseMove = () => {
      if (
        mousePos.current.x > lastImagePosition.current.x + 80 ||
        mousePos.current.x < lastImagePosition.current.x - 80 ||
        mousePos.current.y > lastImagePosition.current.y + 80 ||
        mousePos.current.y < lastImagePosition.current.y - 80
      ) {
        addImage(mousePos.current.x, mousePos.current.y)
        i++
        lastImagePosition.current = {
          x: mousePos.current.x,
          y: mousePos.current.y
        }
        if (imagesContainer.children.length > 12) {
          imagesContainer.removeChild(imagesContainer.firstChild!)
        }
      }
    }

    const throttleHandleMouseMove = throttle(10, handleMouseMove)

    document.addEventListener('mousemove', (e) => {
      throttleHandleMouseMove()
      mousePos.current = { x: e.clientX - 100, y: e.clientY - 150 }
    })

    requestRef.current = requestAnimationFrame(setCachedMousePosition)

    return () => {
      cancelAnimationFrame(requestRef.current)
      document.removeEventListener('mousemove', throttleHandleMouseMove)
    }
  }, [setCachedMousePosition])

  return (
    <>
      <header>
        <a href='#'>CONFIOTE</a>
      </header>
      <main>
        <h1>
          <span>JUSTE</span>
          <span>UNE</span>
          <span>CONFIOTE</span>
          <span>FIGUE-NOIX</span>
        </h1>
        <div ref={imagesContainerRef} className='images-container'></div>
      </main>
    </>
  )
}

export default App
