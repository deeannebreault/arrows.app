import {Point} from "../model/Point";
import {doubleClick, endDrag, mouseDown, mouseMove, mouseUp, wheel} from "../actions/mouse";
import {Vector} from "../model/Vector";
import {isMac} from "./Keybindings";

export default class MouseHandler {
  constructor(canvas) {
    this.canvas = canvas

    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))

    // Touch support
    this._lastTap = 0
    this._pinchDist = null
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
  }

  handleWheel (evt) {
    this.dispatch(wheel(this.canvasPosition(evt), new Vector(evt.deltaX, evt.deltaY), evt.ctrlKey))
    evt.preventDefault()
  }

  handleDoubleClick (evt) {
    this.dispatch(doubleClick(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseMove (evt) {
    if (evt.button !== 0) {
      return
    }
    this.dispatch(mouseMove(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseDown (evt) {
    if (evt.button !== 0) {
      return
    }

    this.dispatch(mouseDown(this.canvasPosition(evt), isMac ? evt.metaKey : evt.ctrlKey))
    evt.preventDefault()
  }

  handleMouseUp (evt) {
    if (evt.button !== 0) {
      return
    }

    this.dispatch(mouseUp(this.canvasPosition(evt)))
    evt.preventDefault()
  }

  handleMouseLeave (evt) {
    this.dispatch(endDrag())
    evt.preventDefault()
  }

  handleTouchStart(evt) {
    evt.preventDefault()
    if (evt.touches.length === 1) {
      const pos = this.touchPosition(evt.touches[0])
      this.dispatch(mouseDown(pos, false))

      // Double-tap detection
      const now = Date.now()
      if (now - this._lastTap < 300) {
        this.dispatch(doubleClick(pos))
      }
      this._lastTap = now
      this._pinchDist = null
    } else if (evt.touches.length === 2) {
      this._pinchDist = this.pinchDistance(evt.touches)
      this.dispatch(endDrag())
    }
  }

  handleTouchMove(evt) {
    evt.preventDefault()
    if (evt.touches.length === 1 && this._pinchDist === null) {
      this.dispatch(mouseMove(this.touchPosition(evt.touches[0])))
    } else if (evt.touches.length === 2) {
      const newDist = this.pinchDistance(evt.touches)
      if (this._pinchDist !== null) {
        const delta = this._pinchDist - newDist
        const midpoint = this.touchMidpoint(evt.touches)
        this.dispatch(wheel(midpoint, new Vector(0, delta * 0.5), false))
      }
      this._pinchDist = newDist
    }
  }

  handleTouchEnd(evt) {
    evt.preventDefault()
    if (evt.changedTouches.length > 0) {
      this.dispatch(mouseUp(this.touchPosition(evt.changedTouches[0])))
    }
    if (evt.touches.length < 2) {
      this._pinchDist = null
    }
  }

  touchPosition(touch) {
    let rect = this.canvas.getBoundingClientRect()
    return new Point(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  touchMidpoint(touches) {
    let rect = this.canvas.getBoundingClientRect()
    return new Point(
      (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
      (touches[0].clientY + touches[1].clientY) / 2 - rect.top
    )
  }

  pinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  canvasPosition(event) {
    let rect = this.canvas.getBoundingClientRect()
    return new Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    )
  }
}

