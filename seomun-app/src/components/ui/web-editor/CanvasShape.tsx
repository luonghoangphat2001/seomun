import { ShapeObject } from '@/types';
import Konva from 'konva';
import { Circle, Line, Rect, RegularPolygon, Star } from 'react-konva';

interface CanvasShapeProps {
  obj: ShapeObject;
  onSelect: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const getStarPoints = (numPoints: number, innerRadius: number, outerRadius: number) => {
  const points = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / numPoints - Math.PI / 2;
    points.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  return points;
};

export const CanvasShape = ({ obj, onSelect, onDragMove, onDragEnd, onTransformEnd }: CanvasShapeProps) => {
  const shapeProps = {
    id: obj.id,
    x: obj.position.x,
    y: obj.position.y,
    fill: obj.fill,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    rotation: obj.rotation,
    opacity: obj.opacity,
    draggable: !obj.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragMove,
    onDragEnd,
    onTransformEnd,
  };

  if (obj.shapeType === 'rectangle' || obj.shapeType === 'rounded_rectangle') {
    return (
      <Rect
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        cornerRadius={obj.cornerRadius || (obj.shapeType === 'rounded_rectangle' ? 20 : 0)}
      />
    );
  }

  if (obj.shapeType === 'circle') {
    return <Circle {...shapeProps} width={obj.size.width} height={obj.size.height} radius={obj.size.width / 2} />;
  }

  if (obj.shapeType === 'triangle' || obj.shapeType === 'triangle_down') {
    return (
      <RegularPolygon
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        sides={3}
        radius={obj.size.width / Math.sqrt(2)}
        rotation={obj.rotation + (obj.shapeType === 'triangle_down' ? 180 : 0)}
      />
    );
  }

  if (obj.shapeType === 'diamond') {
    return (
      <RegularPolygon
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        sides={4}
        radius={obj.size.width / Math.sqrt(2)}
      />
    );
  }

  if (obj.shapeType === 'star_5') {
    return (
      <Star
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        numPoints={5}
        innerRadius={obj.size.width / 4}
        outerRadius={obj.size.width / Math.sqrt(2)}
      />
    );
  }

  if (obj.shapeType === 'star_4') {
    return (
      <Star
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        numPoints={4}
        innerRadius={obj.size.width / 6}
        outerRadius={obj.size.width / Math.sqrt(2)}
      />
    );
  }

  if (obj.shapeType === 'star_6') {
    return (
      <Star
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        numPoints={6}
        innerRadius={obj.size.width / 4}
        outerRadius={obj.size.width / Math.sqrt(2)}
      />
    );
  }

  if (obj.shapeType === 'burst_12') {
    return (
      <Star
        {...shapeProps}
        width={obj.size.width}
        height={obj.size.height}
        numPoints={12}
        innerRadius={obj.size.width / 3}
        outerRadius={obj.size.width / Math.sqrt(2)}
      />
    );
  }

  if (obj.shapeType === 'scallop_1' || obj.shapeType === 'scallop_2') {
    const outerRadius = obj.size.width / Math.sqrt(2);
    const innerRadius = obj.shapeType === 'scallop_1' ? outerRadius * 0.75 : outerRadius * 0.9;

    return (
      <Line
        {...shapeProps}
        x={obj.position.x}
        y={obj.position.y}
        points={getStarPoints(10, innerRadius, outerRadius)}
        closed
        tension={0.5}
        fill={obj.fill}
        stroke={obj.stroke}
        strokeWidth={obj.strokeWidth}
      />
    );
  }

  return null;
};
