import { DrawingContext } from "./utils/DrawingContext"
import { Coordinate } from "@neo4j-arrows/model"

export const drawTextAnnotation = (ctx, annotation, viewTransformation) => {
  const position = viewTransformation.apply(annotation.position)
  const { text, style } = annotation
  
  ctx.save()
  ctx.font = `${style.fontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // Draw background if not transparent
  if (style.backgroundColor !== 'transparent') {
    const lines = text.split('\n')
    const lineHeight = style.fontSize * 1.2
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const totalHeight = lines.length * lineHeight
    
    ctx.fillStyle = style.backgroundColor
    ctx.fillRect(position.x - 4, position.y - 2, maxWidth + 8, totalHeight + 4)
    ctx.fillStyle = style.color
  }
  
  // Draw text
  const lines = text.split('\n')
  const lineHeight = style.fontSize * 1.2
  lines.forEach((line, i) => {
    ctx.fillText(line, position.x, position.y + i * lineHeight)
  })
  
  ctx.restore()
}

export const drawDrawingAnnotation = (ctx, annotation, viewTransformation) => {
  if (annotation.points.length < 2) return
  
  const { points, style } = annotation
  
  ctx.save()
  ctx.strokeStyle = style.strokeColor
  ctx.lineWidth = style.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  const startPoint = viewTransformation.apply(points[0])
  ctx.moveTo(startPoint.x, startPoint.y)
  
  for (let i = 1; i < points.length; i++) {
    const point = viewTransformation.apply(points[i])
    ctx.lineTo(point.x, point.y)
  }
  
  ctx.stroke()
  ctx.restore()
}

export const drawAnnotationSelection = (ctx, annotation, viewTransformation) => {
  ctx.save()
  ctx.strokeStyle = '#4285f4'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  
  if (annotation.type === 'TEXT') {
    const position = viewTransformation.apply(annotation.position)
    const metrics = ctx.measureText(annotation.text)
    const fontSize = annotation.style.fontSize
    const lines = annotation.text.split('\n')
    const lineHeight = fontSize * 1.2
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const totalHeight = lines.length * lineHeight
    
    ctx.strokeRect(
      position.x - 6,
      position.y - 4,
      maxWidth + 12,
      totalHeight + 8
    )
  } else if (annotation.type === 'DRAWING') {
    // Draw bounding box around drawing
    if (annotation.points.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      annotation.points.forEach(point => {
        const transformed = viewTransformation.apply(point)
        minX = Math.min(minX, transformed.x)
        minY = Math.min(minY, transformed.y)
        maxX = Math.max(maxX, transformed.x)
        maxY = Math.max(maxY, transformed.y)
      })
      
      const padding = 8
      ctx.strokeRect(
        minX - padding,
        minY - padding,
        maxX - minX + padding * 2,
        maxY - minY + padding * 2
      )
    }
  }
  
  ctx.restore()
}
