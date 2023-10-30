import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { throttle } from 'throttle-debounce'

const App = () => {
	const imagesContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const imagesContainer = imagesContainerRef.current!
		let i = 0
		let timestamp = 0
		let lastMouseX = 0
		let lastMouseY = 0
		let movement = { x: 0, y: 0 }
		let lastImagePosition = { x: 0, y: 0 }

		const handleMouseSpeed = (e: MouseEvent) => {
			if (timestamp === null) {
				timestamp = Date.now()
				lastMouseX = e.screenX
				lastMouseY = e.screenY
				return
			}

			const now = Date.now()
			const dt = now - timestamp
			const dx = e.screenX - lastMouseX
			const dy = e.screenY - lastMouseY
			const speedX = dx / dt
			const speedY = dy / dt
			movement = { x: speedX, y: speedY }

			timestamp = now
			lastMouseX = e.screenX
			lastMouseY = e.screenY
		}

		const addImage = (x: number, y: number) => {
			x = x - 100
			y = y - 150
			const imgSrc = `/src/assets/img/${i % 8}.jpeg`
			const img = new Image()
			img.src = imgSrc
			img.onload = () => {
				const image = document.createElement('img')
				image.src = imgSrc
				imagesContainer.appendChild(image)
				gsap.fromTo(
					image,
					{
						x,
						y
					},
					{
						duration: 2,
						x: x + movement.x * 16,
						y: y + movement.y * 16,
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

		const handleMouseMove = (e: MouseEvent) => {
			const { clientX: x, clientY: y } = e

			if (
				x > lastImagePosition.x + 80 ||
				x < lastImagePosition.x - 80 ||
				y > lastImagePosition.y + 80 ||
				y < lastImagePosition.y - 80
			) {
				addImage(x, y)
				i++
				lastImagePosition = { x, y }
				if (imagesContainer.children.length > 20) {
					imagesContainer.removeChild(imagesContainer.firstChild!)
				}
			}
		}

		const throttleHandleMouseMove = throttle(10, handleMouseMove)

		document.addEventListener('mousemove', (e) => {
			throttleHandleMouseMove(e)
			handleMouseSpeed(e)
		})

		return () => {
			document.removeEventListener('mousemove', throttleHandleMouseMove)
		}
	})

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
