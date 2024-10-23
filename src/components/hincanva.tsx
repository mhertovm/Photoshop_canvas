"use client";
import { useEffect, useRef, useState } from 'react';

const CanvasWithResizableAndRotatable = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [angle, setAngle] = useState(0);
  const [rect, setRect] = useState({
    x: 150,
    y: 100,
    width: 200,
    height: 150,
    resizeHandleSize: 10,
    rotateHandleSize: 10,
  });
  const layers = [
    {
      name: "layer1",
      x: 30,//initial position
      y: 30,//initial position
      width: 500,
      height: 500,
      scaleFactor: 1,
      active: false,
      type: "image",
      url: 'https://images.pexels.com/photos/14998052/pexels-photo-14998052/free-photo-of-photo-of-a-camera-body-on-yellow-background.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      rotation: 0,
    },

    {
      name: "lineOne",
      x: 30,
      y: 30,
      width: 100,
      height: 100,
      scaleFactor: 1,
      active: false,
      type: "text",
      fontSize: 43,
      fontWeight: 23,
      text: 'This is line',
      color: 'white',
      //here you can add any properties like fontFamily etc
      rotation: 0,
    },
    // you can add other types like rectangle etc
  ]

  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const draw = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    layers.forEach((item) => {
      if (item.type === "image") {
        drawImage(item);
      } else if (item.type === "text") {
        drawText(item);
      }
    });
  }

  const drawImage = (item: any) => {

    if (!item.img) {
      let image = new Image();
      image.src = item.url;
      item.img = image;
      image.onload = () => {
        draw();
      }
      return;
    }

    ctx.save();
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(item.rotation);
    const aspectRatio = item.img.width / item.img.height;
    // Adjust either the width or height based on the aspect ratio
    let drawWidth = item.width;
    let drawHeight = item.height;
    if (item.width / item.height !== aspectRatio) {
      if (item.width / item.height > aspectRatio) {
        drawWidth = item.height * aspectRatio;
      } else {
        drawHeight = item.width / aspectRatio;
      }
    }

    ctx.scale(item.scaleFactor, item.scaleFactor);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(item.img, item.x, item.y, drawWidth, drawHeight);

    ctx.restore();
  }
  const drawText = (item: any) => {

    ctx.save();
    ctx.fillStyle = item.color;
    ctx.font = `${item.fontWeight} ${item.fontSize * item.scaleFactor}px ${item.fontFamily}`;
    const textWidth = ctx.measureText(item.text).width;
    item.width = textWidth;
    item.height = item.fontSize;
    item.calculatedY = item.y - item.height;
    ctx.fillText(item.text, item.x, item.y);
    ctx.restore()
  }
  draw();
  // const draw = () => {
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   ctx.save(); // Save the current state

  //   // Move the origin to the center of the rectangle for rotation
  //   ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
  //   ctx.rotate((angle * Math.PI) / 180); // Rotate by the angle in radians
  //   ctx.translate(-rect.width / 2, -rect.height / 2); // Move back to draw the rectangle

  //   // Draw the rectangle (the "layer")
  //   ctx.fillStyle = 'lightblue';
  //   ctx.fillRect(0, 0, rect.width, rect.height);

  //   // Restore the context
  //   ctx.restore();

  //   // Draw resize button (bottom-right corner)
  //   ctx.fillStyle = 'red';
  //   const handleX = rect.x + rect.width - rect.resizeHandleSize / 2;
  //   const handleY = rect.y + rect.height - rect.resizeHandleSize / 2;
  //   ctx.fillRect(
  //     handleX,
  //     handleY,
  //     rect.resizeHandleSize,
  //     rect.resizeHandleSize
  //   );

  //   // Draw rotate button (above the rectangle center)
  //   ctx.fillStyle = 'green';
  //   const rotateHandleX = rect.x + rect.width / 2 - rect.rotateHandleSize / 2;
  //   const rotateHandleY = rect.y - rect.rotateHandleSize;
  //   ctx.fillRect(
  //     rotateHandleX,
  //     rotateHandleY,
  //     rect.rotateHandleSize,
  //     rect.rotateHandleSize
  //   );

  //   // Draw the buttons rotated with the rectangle
  //   ctx.save(); // Save the current state
  //   ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
  //   ctx.rotate((angle * Math.PI) / 180); // Rotate buttons

  //   // Resize button (in the correct position after rotation)
  //   ctx.fillStyle = 'red';
  //   ctx.fillRect(
  //     rect.width / 2 - rect.resizeHandleSize / 2,
  //     rect.height / 2,
  //     rect.resizeHandleSize,
  //     rect.resizeHandleSize
  //   );

  //   // Rotate button (above center)
  //   ctx.fillStyle = 'green';
  //   ctx.fillRect(
  //     -rect.rotateHandleSize / 2,
  //     -rect.height / 2 - rect.rotateHandleSize,
  //     rect.rotateHandleSize,
  //     rect.rotateHandleSize
  //   );

  //   // Restore the context
  //   ctx.restore();
  // };


  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function getClientCoordinates(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    var canvasRect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / canvasRect.width;
    var scaleY = canvas.height / canvasRect.height;
    return {
      x: (e.clientX - canvasRect.left) * scaleX,
      y: (e.clientY - canvasRect.top) * scaleY,
    };
  }

  function IsThePointerInTheObject(x: any, y: any, object: any) {
    const scaledWidth = object.width * object.scaleFactor;
    const scaledHeight = object.height * object.scaleFactor;
    let centerX = object.x + object.width / 2;
    let centerY = object.y + object.height / 2;
    let newX = centerX - scaledWidth / 2;
    let newY = centerY - scaledHeight / 2;
    if (
      x >= newX &&
      x <= newX + scaledWidth &&
      y >= newY &&
      y <= newY + scaledHeight
    ) {
      return true;
    }
    return false;
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    let coordinates = getClientCoordinates(e);
    layers.forEach((item) => {
      item.active = false;
    });
    for (let obj of layers) {
      if (IsThePointerInTheObject(mouseX, mouseY, obj)) {
        isDragging = true;
        offsetX = mouseX - obj.x;
        offsetY = mouseY - obj.y;
        obj.active = true;
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    if (isDragging) {
      let activeObject = layers.find((dr) => dr.active === true);
      if (activeObject) {
        activeObject.x = mouseX - offsetX;
        activeObject.y = mouseY - offsetY;
      }
      draw();
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
    draw()
  };

  // const whele = (e: React.MouseEvent<HTMLCanvasElement>) => {
  //   e.preventDefault();
  //   let activeObject = layers.find((dr) => dr.active === true);
  //   if (activeObject) {
  //     if (e.deltaY < 0) {
  //       activeObject.scaleFactor *= 1.1;
  //     } else {
  //       activeObject.scaleFactor /= 1.1;
  //     }
  //     draw();
  //   }
  // }

  // const keydown = (e: React.MouseEvent<HTMLCanvasElement>) => {
  //   let activeObject = layers.find((dr) => dr.active === true);
  //   if (activeObject) {
  //     if (e.key === "ArrowUp") {
  //       activeObject.rotation -= 0.1;
  //     } else if (e.key === "ArrowDown") {
  //       activeObject.rotation += 0.1;
  //     } else if (e.key === "ArrowLeft") {
  //       activeObject.rotation -= 0.1;
  //     } else if (e.key === "ArrowRight") {
  //       activeObject.rotation += 0.1;
  //     }
  //     draw();
  //   }
  // }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      // onWheel={whele}
      // onKeyDown={keydown}
    />
  );
};

export default CanvasWithResizableAndRotatable;




