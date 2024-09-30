import defaultImg from '../assets/kaminaly.jpg'
import { button, buttonGroup, Leva, useControls } from 'leva'
import React, { useRef, useEffect } from 'react'
import { isMobile } from 'react-device-detect'

const Guruguru: React.FC = () => {
  const width = 600
  const height = 600
  const halfWidth = width * 0.5
  const halfHeight = height * 0.5

  const [
    { color, angleIncrement, radiusIncrement, size, speed, drawing, invert, type, useAlpha, yure },
    set,
  ] = useControls(() => ({
    image: {
      // value: '',
      image: defaultImg.src,
      onChange: (value) => {
        if (value) handleImageChange(value)
      },
    },
    speed: {
      value: 800,
      min: 1,
      max: 1000,
      step: 1,
    },
    type: {
      value: 'grayscale',
      options: ['grayscale', 'red', 'green', 'blue', 'alpha'],
    },
    useAlpha: false,
    invert: false,
    color: '#000000',
    angleIncrement: {
      value: 1,
      min: 0.1,
      max: 100,
      step: 0.1,
      label: 'angle',
    },
    radiusIncrement: {
      value: 1,
      min: 0.1,
      max: 100,
      step: 0.1,
      label: 'radius',
    },
    size: {
      value: [0.5, 1.0],
      min: 0.1,
      max: 10,
      step: 0.01,
    },

    yure: {
      value: 0.5,
      min: 0.01,
      max: 1,
      step: 0.01,
    },

    drawing: true,
    reset: button(() => {
      willClearRef.current = true
    }),
    note: {
      value: `よく見かける表現だけど、濃いところをギザギザさせるの良いなと思った`,
      editable: false,
    },
    ' ': buttonGroup({
      関連リンク: () =>
        (location.href = 'https://www.boredpanda.com/single-line-plotter-drawings-sergej-stoppel/'),
    }),
  }))
  const colorRef = useRef(color)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const radiusRef = useRef(0)
  const sizeRef = useRef(size)
  const speedRef = useRef(speed)
  const angleIncrementRef = useRef(angleIncrement)
  const radiusIncrementRef = useRef(radiusIncrement)
  const typeRef = useRef(type)
  const useAlphaRef = useRef(useAlpha)
  const invertRef = useRef(invert)
  const isDrawingRef = useRef(drawing)
  const willClearRef = useRef(false)

  const yureRef = useRef(yure)

  const imageData = useRef<ImageData | null>(null)

  useEffect(() => {
    colorRef.current = color
  }, [color])
  useEffect(() => {
    angleIncrementRef.current = angleIncrement
  }, [angleIncrement])
  useEffect(() => {
    radiusIncrementRef.current = radiusIncrement
  }, [radiusIncrement])
  useEffect(() => {
    isDrawingRef.current = drawing
  }, [drawing])
  useEffect(() => {
    sizeRef.current = size
  }, [size])
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  useEffect(() => {
    typeRef.current = type
  }, [type])
  useEffect(() => {
    useAlphaRef.current = useAlpha
  }, [useAlpha])
  useEffect(() => {
    invertRef.current = invert
  }, [invert])

  useEffect(() => {
    yureRef.current = yure
  }, [yure])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let animationFrameId

    const animate = () => {
      if (willClearRef.current) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        radiusRef.current = 0
        angleRef.current = 0
        willClearRef.current = false
      }

      if (isDrawingRef.current && imageData.current) {
        context.save()
        context.translate(halfWidth, halfHeight)

        for (let i = 0; i < speedRef.current; i++) {
          angleRef.current += angleIncrementRef.current / (radiusRef.current + 1)
          radiusRef.current += radiusIncrementRef.current / (radiusRef.current + 1)

          let radius = radiusRef.current
          let x = Math.cos(angleRef.current) * radius
          let y = Math.sin(angleRef.current) * radius

          const color = getColor(Math.round(x) + halfWidth, Math.round(y) + halfHeight)
          let sizeRatio =
            (color[typeRef.current] / 255) *
            (useAlphaRef.current && typeRef.current !== 'alpha' ? color.alpha : 1)
          if (!invertRef.current) sizeRatio = 1 - sizeRatio

          radius =
            radiusRef.current +
            Math.sin(radiusRef.current * angleRef.current * yureRef.current) * sizeRatio * 1 +
            // Math.sin(radiusRef.current * angleRef.current * yureRef.current) * 1 +
            // Math.tan(angleRef.current * 3) +
            // (Math.random() - 0.5) * 2 +
            0
          x = Math.cos(angleRef.current) * radius
          y = Math.sin(angleRef.current) * radius

          context.beginPath()
          context.arc(
            x,
            y,
            (sizeRef.current[1] - sizeRef.current[0]) * sizeRatio + sizeRef.current[0],
            0,
            2 * Math.PI,
          )
          context.fillStyle = colorRef.current
          context.fill()
        }

        context.restore()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleImageChange = (file) => {
    if (!file) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      const imgAspect = img.width / img.height
      const canvasAspect = width / height

      let drawWidth = 0
      let drawHeight = 0
      let offsetX = 0
      let offsetY = 0
      if (imgAspect > canvasAspect) {
        drawWidth = height * imgAspect
        drawHeight = height
        offsetX = ((drawWidth - width) / 2) * -1
      } else {
        drawWidth = width
        drawHeight = width / imgAspect
        offsetY = ((drawHeight - height) / 2) * -1
      }

      if (ctx) {
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        imageData.current = ctx.getImageData(0, 0, width, height)
      }
    }
    img.src = file
  }

  function getColor(x: number, y: number) {
    const { data } = imageData.current
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const index = (y * width + x) * 4
      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const alpha = data[index + 3] / 255
      const grayscale = 0.299 * red + 0.587 * green + 0.114 * blue
      return { red, green, blue, alpha, grayscale }
    } else {
      return { red: 0, green: 0, blue: 0, alpha: 0, grayscale: 0 }
    }
  }

  return (
    <>
      <Leva
        hideCopyButton={true}
        collapsed={isMobile}
        titleBar={isMobile ? { position: { x: 10, y: -10 } } : true}
        theme={
          isMobile
            ? {
                sizes: {
                  titleBarHeight: '30px',
                },
              }
            : {}
        }
      />
      <div className="flex min-h-screen w-full items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} width={width} height={height} className="" />
      </div>
    </>
  )
}

export default Guruguru
