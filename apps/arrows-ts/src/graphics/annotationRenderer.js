export const drawTextAnnotation = (ctx, annotation, viewTransformation) => {
  try {
    // Position is already in graph coordinates, ctx is already transformed
    const position = annotation.position || { x: 0, y: 0 };
    const text = annotation.text || '';
    const style = annotation.style || {};

    const fontSize = style.fontSize || 16;
    const fontFamily = style.fontFamily || 'sans-serif';
    const color = style.color || '#000000';
    const backgroundColor = style.backgroundColor || 'rgba(255, 255, 200, 0.8)';

    ctx.save();
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw background
    if (text.length > 0) {
      const lines = text.split('\n');
      const lineHeight = fontSize * 1.2;
      let maxWidth = 50; // minimum width
      try {
        maxWidth = Math.max(
          ...lines.map((line) => ctx.measureText(line).width)
        );
      } catch (e) {
        // Fallback if measureText fails
        maxWidth = text.length * fontSize * 0.6;
      }
      const totalHeight = lines.length * lineHeight;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(
        position.x - 4,
        position.y - 2,
        maxWidth + 8,
        totalHeight + 4
      );
      ctx.fillStyle = color;

      // Draw text
      lines.forEach((line, i) => {
        ctx.fillText(line, position.x, position.y + i * lineHeight);
      });
    }

    ctx.restore();
  } catch (err) {
    console.error('Error drawing text annotation:', err);
  }
};

export const drawDrawingAnnotation = (ctx, annotation, viewTransformation) => {
  if (annotation.points.length < 2) return;

  const { points, style } = annotation;

  ctx.save();
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Points are already in graph coordinates
  const startPoint = points[0];
  ctx.moveTo(startPoint.x, startPoint.y);

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.restore();
};

export const drawRectangleAnnotation = (ctx, annotation) => {
  const { position, width, height, style } = annotation;
  if (!position || width <= 0 || height <= 0) return;

  ctx.save();

  if (style.fillOpacity > 0) {
    ctx.globalAlpha = style.fillOpacity;
    ctx.fillStyle = style.fillColor || '#4a90d9';
    ctx.fillRect(position.x, position.y, width, height);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = style.strokeColor || '#4a90d9';
  ctx.lineWidth = style.strokeWidth || 2;
  ctx.lineJoin = 'round';
  ctx.strokeRect(position.x, position.y, width, height);

  ctx.restore();
};

export const drawRectPreview = (ctx, from, to, viewTransformation) => {
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  const w = Math.abs(to.x - from.x);
  const h = Math.abs(to.y - from.y);

  ctx.save();
  ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
  ctx.scale(viewTransformation.scale, viewTransformation.scale);

  ctx.strokeStyle = '#4a90d9';
  ctx.lineWidth = 2 / viewTransformation.scale;
  ctx.setLineDash([6 / viewTransformation.scale, 3 / viewTransformation.scale]);
  ctx.lineJoin = 'round';
  ctx.strokeRect(x, y, w, h);

  // Corner dots
  ctx.fillStyle = '#4a90d9';
  ctx.setLineDash([]);
  const r = 4 / viewTransformation.scale;
  [[from.x, from.y], [to.x, to.y]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};

export const drawAnnotationSelection = (
  ctx,
  annotation,
  viewTransformation
) => {
  ctx.save();
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  if (annotation.type === 'TEXT') {
    const position = viewTransformation.apply(annotation.position);
    const metrics = ctx.measureText(annotation.text);
    const fontSize = annotation.style.fontSize;
    const lines = annotation.text.split('\n');
    const lineHeight = fontSize * 1.2;
    const maxWidth = Math.max(
      ...lines.map((line) => ctx.measureText(line).width)
    );
    const totalHeight = lines.length * lineHeight;

    ctx.strokeRect(
      position.x - 6,
      position.y - 4,
      maxWidth + 12,
      totalHeight + 8
    );
  } else if (annotation.type === 'RECTANGLE') {
    const tl = viewTransformation.apply(annotation.position);
    const scale = viewTransformation.scale;
    const padding = 6;
    ctx.strokeRect(
      tl.x - padding,
      tl.y - padding,
      annotation.width * scale + padding * 2,
      annotation.height * scale + padding * 2
    );
  } else if (annotation.type === 'DRAWING') {
    if (annotation.points.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      annotation.points.forEach((point) => {
        const transformed = viewTransformation.apply(point);
        minX = Math.min(minX, transformed.x);
        minY = Math.min(minY, transformed.y);
        maxX = Math.max(maxX, transformed.x);
        maxY = Math.max(maxY, transformed.y);
      });
      const padding = 8;
      ctx.strokeRect(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
    }
  }

  ctx.restore();
};
