import {relationshipHitTolerance, ringMargin} from "./constants";
import {combineBoundingBoxes} from "./utils/BoundingBox";
import {drawTextAnnotation, drawDrawingAnnotation, drawAnnotationSelection} from "./annotationRenderer";
import {Point} from "../model/Point";

export default class VisualGraph {
  constructor(graph, nodes, relationshipBundles, measureTextContext) {
    this.graph = graph
    this.nodes = nodes
    this.relationshipBundles = relationshipBundles
    this.measureTextContext = measureTextContext
    this.annotations = graph.annotations || []
  }

  annotationAtPoint(point) {
    // Check in reverse order (top-most first)
    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const annotation = this.annotations[i]
      if (this.hitTestAnnotation(annotation, point)) {
        return annotation
      }
    }
    return null
  }

  hitTestAnnotation(annotation, point) {
    if (annotation.type === 'TEXT') {
      // Simple bounding box hit test for text
      const fontSize = annotation.style.fontSize
      const lines = annotation.text.split('\n')
      const lineHeight = fontSize * 1.2
      
      // Use a temporary canvas to measure text
      if (this.measureTextContext) {
        this.measureTextContext.font = `${fontSize}px ${annotation.style.fontFamily}`
        const maxWidth = Math.max(...lines.map(line => this.measureTextContext.measureText(line).width))
        const totalHeight = lines.length * lineHeight
        
        const minX = annotation.position.x
        const minY = annotation.position.y
        const maxX = minX + maxWidth
        const maxY = minY + totalHeight
        
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
      }
      
      // Fallback: approximate hit test
      const approxWidth = annotation.text.length * fontSize * 0.6
      const approxHeight = lines.length * lineHeight
      return point.x >= annotation.position.x && 
             point.x <= annotation.position.x + approxWidth &&
             point.y >= annotation.position.y && 
             point.y <= annotation.position.y + approxHeight
    } else if (annotation.type === 'DRAWING') {
      // Hit test drawing - check if point is near any line segment
      const tolerance = 10
      for (let i = 1; i < annotation.points.length; i++) {
        const p1 = annotation.points[i - 1]
        const p2 = annotation.points[i]
        const distance = this.distanceToLineSegment(point, p1, p2)
        if (distance <= tolerance) {
          return true
        }
      }
      return false
    }
    return false
  }

  distanceToLineSegment(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y
    const length = Math.sqrt(dx * dx + dy * dy)
    
    if (length === 0) {
      return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
    }
    
    const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)))
    const projectionX = lineStart.x + t * dx
    const projectionY = lineStart.y + t * dy
    
    return Math.sqrt((point.x - projectionX) ** 2 + (point.y - projectionY) ** 2)
  }

  get style () {
    return this.graph.style
  }

  entityAtPoint(point) {
    const annotation = this.annotationAtPoint(point)
    if (annotation) return { ...annotation, entityType: 'annotation' }

    const node = this.nodeAtPoint(point)
    if (node) return { ...node, entityType: 'node' }

    const nodeRing = this.nodeRingAtPoint(point)
    if (nodeRing) return { ...nodeRing, entityType: 'nodeRing' }

    const relationship = this.relationshipAtPoint(point)
    if (relationship) return { ...relationship, entityType: 'relationship' }

    return null
  }

  nodeAtPoint(point) {
    return this.closestNode(point, (visualNode, distance) => {
      return distance < visualNode.radius
    })
  }

  nodeRingAtPoint(point) {
    return this.closestNode(point, (visualNode, distance) => {
      const nodeRadius = visualNode.radius
      return distance > nodeRadius && distance < nodeRadius + ringMargin
    })
  }

  entitiesInBoundingBox(boundingBox) {
    const nodes = this.graph.nodes.filter(node => boundingBox.contains(node.position))
      .map(node => ({ ...node, entityType: 'node' }))
    const relationships = this.relationshipBundles.flatMap(bundle => bundle.routedRelationships)
      .filter(routedRelationship => boundingBox.contains(routedRelationship.arrow.midPoint()))
      .map(routedRelationship => routedRelationship.resolvedRelationship)
      .map(relationship => ({ ...relationship, entityType: 'relationship' }))

    return [...nodes, ...relationships]
  }

  closestNode(point, hitTest) {
    let closestDistance = Number.POSITIVE_INFINITY
    let closestNode = null
    this.graph.nodes.filter(node => node.status !== 'combined').forEach((node) => {
      const visualNode = this.nodes[node.id]
      const distance = visualNode.distanceFrom(point)
      if (distance < closestDistance && hitTest(visualNode, distance)) {
        closestDistance = distance
        closestNode = node
      }
    })
    return closestNode
  }

  relationshipAtPoint(point) {
    return this.closestRelationship(point, (relationship, distance) => distance <= relationshipHitTolerance)
  }

  closestRelationship(point, hitTest) {
    let minDistance = Number.POSITIVE_INFINITY
    let closestRelationship = null
    this.relationshipBundles.forEach(bundle => {
      bundle.routedRelationships.forEach(routedRelationship => {
        const distance = routedRelationship.distanceFrom(point)
        if (distance < minDistance && hitTest(routedRelationship.resolvedRelationship, distance)) {
          minDistance = distance
          closestRelationship = routedRelationship.resolvedRelationship
        }
      })
    })

    return closestRelationship
  }

  draw(ctx, displayOptions) {
    ctx.save()
    const viewTransformation = displayOptions.viewTransformation
    ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy)
    ctx.scale(viewTransformation.scale)
    this.relationshipBundles.forEach(bundle => bundle.draw(ctx))
    Object.values(this.nodes).forEach(visualNode => {
      visualNode.draw(ctx)
    })
    // Draw annotations
    this.annotations.forEach(annotation => {
      if (annotation.type === 'TEXT') {
        drawTextAnnotation(ctx, annotation, viewTransformation)
      } else if (annotation.type === 'DRAWING') {
        drawDrawingAnnotation(ctx, annotation, viewTransformation)
      }
    })
    ctx.restore()
  }

  boundingBox() {
    const nodeBoxes = Object.values(this.nodes).map(node => node.boundingBox())
    const relationshipBoxes = Object.values(this.relationshipBundles).map(bundle => bundle.boundingBox())
    return combineBoundingBoxes([...nodeBoxes, ...relationshipBoxes])
  }
}