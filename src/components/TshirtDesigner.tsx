"use client";
import React, { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';


interface Layer {
  id: string;
  type: 'image' | 'text';
  src?: HTMLImageElement; // Optional for image layers
  text?: string; // Optional for text layers
  x: number;
  y: number;
  angle: number,
  width: number;
  height: number;
  fontSize?: number; // Optional for text layers
  color?: string; // Optional for text layers
  fontFamily?: string; // Optional for text layers
  textStyle?: string // Optional for text layers
  m?: number
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}



const TshirtDesigner: React.FC = () => {
  const _scale = 3
  const _onCanvaButtonSize = 20;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 794 / _scale, height: 1123 / _scale }); // Default to A4
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0, width: 0, height: 0 });
  const [isModify, setIsModify] = useState<string>("all");

  const [textStyle, setTextStyle] = useState("normal");

  // So, 1 mm is approximately 3.78 pixels at 96 DPI.
  const [imageWidth, setImageWidth] = useState<number>();
  const [imageHeight, setImageHeight] = useState<number>();
  const [borderColor, setBorderColor] = useState<string>("black");

  // This is derived from the conversion:
  // - **1 inch = 2.54 cm**
  // - **1 cm = 10 mm**
  //   1 inch = 25.4mm

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Get the actual dimensions of the image
        const actualWidth = img.naturalWidth / _scale;
        const actualHeight = img.naturalHeight / _scale;
        setImageWidth(actualWidth);
        setImageHeight(actualHeight);

        const newLayer: Layer = {
          id: `img-${Date.now()}`,
          type: 'image',
          src: img,
          x: 120,
          y: 120,
          angle: 0,
          width: actualWidth,   // use actual dimensions
          height: actualHeight, // use actual dimensions
          m: actualWidth
        };

        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
    });
  };

  // Add text layer
  const handleAddText = () => {
    const defaultFontSize = 20;
    const defaultText = 'Custom Text';
    const char = defaultText.split("");
    const newLayer: Layer = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: defaultText,
      x: 120,
      y: 120,
      angle: 0,
      fontSize: defaultFontSize,
      color: '#000000',
      fontFamily: 'Arial',
      width: (char.length * defaultFontSize) / 1.85,
      height: defaultFontSize
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const drawOnCanvaButton = (ctx: CanvasRenderingContext2D, layer: Layer, drawButton: string = "all") => {

    ctx.fillStyle = borderColor;

    // // // Load the trash icon image
    // const trashImage = new Image();
    // trashImage.src = './src/icons/3817209.png'; // Path to your trash icon image

    // trashImage.onload = () => {
    //   // Once the image is loaded, draw it on the canvas
    //   ctx.drawImage(
    //     trashImage,
    //     layer.x + layer.width / 2,
    //     layer.y + layer.height / 2,
    //     _onCanvaButtonSize,
    //     _onCanvaButtonSize
    //   );
    // };

    // Draw resize button
    (drawButton === "all" || drawButton === "resize") && ctx.fillRect(
      layer.x + layer.width / 2,
      layer.y + layer.height / 2,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );

    // Draw resize width button
    (drawButton === "all" || drawButton === "resizeWidth") && ctx.fillRect(
      layer.x + layer.width / 2,
      layer.y - _onCanvaButtonSize / 2,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );

    // Draw resize height button
    (drawButton === "all" || drawButton === "resizeHeight") && ctx.fillRect(
      layer.x - _onCanvaButtonSize / 2,
      layer.y + layer.height / 2,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );


    // Draw delete button
    (drawButton === "all" || drawButton === "delete") && ctx.fillRect(
      layer.x + layer.width / 2,
      layer.y - layer.height / 2 - _onCanvaButtonSize,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );

    // Draw copy button
    (drawButton === "all" || drawButton === "copy") && ctx.fillRect(
      layer.x - layer.width / 2 - _onCanvaButtonSize,
      layer.y + layer.height / 2,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );

    // Draw rotate button
    (drawButton === "all" || drawButton === "rotate") && ctx.fillRect(
      layer.x - layer.width / 2 - _onCanvaButtonSize,
      layer.y - layer.height / 2 - _onCanvaButtonSize,
      _onCanvaButtonSize,
      _onCanvaButtonSize
    );
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      layers.forEach((layer) => {
        // Save the current state
        ctx.save();
        // Move the origin to the center of the rectangle
        ctx.translate(layer.x, layer.y);
        // Rotate the canvas
        ctx.rotate(layer.angle); // Rotate by the angle in radians
        // Draw the rectangle centered at the new origin
        ctx.translate(-layer.x, -layer.y);

        // Draw the buttons
        selectedLayerId === layer.id && drawOnCanvaButton(ctx, layer, isModify);

        if (layer.type === 'image') {
          // Draw the image
          ctx.drawImage(layer.src!, layer.x - layer.width / 2, layer.y - layer.height / 2, layer.width, layer.height);
        } else if (layer.type === 'text') {
          // Draw the text
          ctx.font = `${textStyle} ${layer.fontSize}px ${layer.fontFamily}`;
          ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color!;
          ctx.fillText(layer.text!, layer.x - layer.width / 2, layer.y + layer.height / 2);
        };
        if (selectedLayerId === layer.id) {
          // Draw the frame
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(layer.x - layer.width / 2, layer.y - layer.height / 2, layer.width, layer.height);
        }

        // Restore the canvas state
        ctx.restore();
      });
    };

  }, [layers, canvasSize, selectedLayerId, isModify, borderColor]);

  //to display in the layers section
  const reverseIndex = [...layers]
  for (let i = 0; i < Math.floor(reverseIndex.length / 2); i++) {
    // Swap element at index i with the element at the corresponding reverse index
    [reverseIndex[i], reverseIndex[reverseIndex.length - 1 - i]] = [reverseIndex[reverseIndex.length - 1 - i], reverseIndex[i]];
  }

  // Save canvas as an image
  const saveCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'tshirt_design.png';
      link.click();
    }
  };

  // Handle layer selection
  const selectLayer = (id: string) => {
    setSelectedLayerId(id);
  };

  // Handle layer movement
  const moveSelectedLayer = (dx: number, dy: number) => {
    if (selectedLayerId) {
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === selectedLayerId ? { ...layer, x: layer.x + dx, y: layer.y + dy } : layer
        )
      );
    }
  };

  // Handle resizing
  const resizeSelectedLayer = (dw: number, dh: number, fs: number) => {
    if (selectedLayerId) {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            if (layer.type === 'image') {
              setImageWidth(layer.width! + dw)
              setImageHeight(layer.height! + dh)
              return {
                ...layer,
                width: layer.width! + dw,
                height: layer.height! + dh
              };
            } else if (layer.type === 'text') {
              return {
                ...layer,
                fontSize: layer.fontSize! + fs
              };
            }
          }
          return layer;
        })
      );
    }
  };

  // Change canvas size (A4 and A3 formats)
  const handleCanvasSizeChange = (format: 'A4' | 'A3') => {
    if (format === 'A4') {
      setCanvasSize({ width: 794 / _scale, height: 1123 / _scale }); // A4 size in pixels at 96 DPI
    } else if (format === 'A3') {
      setCanvasSize({ width: 1123 / _scale, height: 1587 / _scale }); // A3 size in pixels at 96 DPI
    }
  };

  // Move layer up in the stack
  const moveLayerDown = (id: string) => {
    setLayers((prev) => {
      const index = prev.findIndex((layer) => layer.id === id);
      if (index > 0) {
        const newLayers = [...prev];
        const [layer] = newLayers.splice(index, 1);
        newLayers.splice(index - 1, 0, layer);
        return newLayers;
      };
      setSelectedLayerId(prev[index].id);
      return prev;
    });
  };

  // Move layer down in the stack
  const moveLayerUp = (id: string) => {
    setLayers((prev) => {
      const index = prev.findIndex((layer) => layer.id === id);
      if (index < prev.length - 1) {
        const newLayers = [...prev];
        const [layer] = newLayers.splice(index, 1);
        newLayers.splice(index + 1, 0, layer);
        return newLayers;
      };
      setSelectedLayerId(prev[index].id);
      return prev;
    });
  };

  // Update text properties
  const updateTextLayer = (property: keyof Layer, value: string | number) => {
    if (selectedLayerId) {
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === selectedLayerId && layer.type === 'text'
            ? { ...layer, [property]: value }
            : layer
        )
      );
    }
  };

  // Delete layer
  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  // Function to resize selected layer
  const handleImageSizeChange = (width: number, height: number, size: number): void => {
    // const _nowSize = Number(e.target.value) / (maxLayerSize / 2)?? 0.1
    if (selectedLayerId) {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            if (layer.type === 'image') {
              return {
                ...layer,
                width: width !== 0 ? width : layer.width,
                height: height !== 0 ? height : layer.height
              };
            } else if (layer.type === 'text') {
              return {
                ...layer,
                fontSize: size
              };
            }
          }
          return layer;
        })
      )
    }
  };

  // Function to start dragging only the selected layer
  const handleMouseDown = (e: React.MouseEvent): void => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayerId) return;
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the mouse position relative to the canvas
    // const mouseX = e.clientX - rect.left;
    // const mouseY = e.clientY - rect.top;

    const handleMouseLayer: any = reverseIndex.find((selectedLayer: Layer) => {
      // Calculate center of rotation
      const centerX = selectedLayer.x;
      const centerY = selectedLayer.y;
      // Calculate the angle of rotation in radians (replace with your actual angle)
      const angle = selectedLayer.angle // Convert degrees to radians
      // Inverse rotation calculation
      const rotatedMouseX = Math.cos(-angle) * (mouseX - centerX) - Math.sin(-angle) * (mouseY - centerY) + centerX;
      const rotatedMouseY = Math.sin(-angle) * (mouseX - centerX) + Math.cos(-angle) * (mouseY - centerY) + centerY;
      // Check if the layer type is "text" and set fontSize accordingly


      // Check if user clicked the layer
      const handleLayerX = selectedLayer.x - selectedLayer.width / 2;
      const handleLayerY = selectedLayer.y - selectedLayer.height / 2;

      // Check if user clicked the resize button
      const handleResizeX = selectedLayer.x + selectedLayer.width / 2;
      const handleResizeY = selectedLayer.y + selectedLayer.height / 2;

      // Check if user clicked the resize width button
      const handleResizeWidthX = selectedLayer.x + selectedLayer.width / 2;
      const handleResizeWidthY = selectedLayer.y - _onCanvaButtonSize / 2;

      // Check if user clicked the resize height button
      const handleResizeHeightX = selectedLayer.x - _onCanvaButtonSize / 2;
      const handleResizeHeightY = selectedLayer.y + selectedLayer.height / 2;

      // Check if user clicked the delete button
      const handleDeleteX = selectedLayer.x + selectedLayer.width / 2;
      const handleDeleteY = selectedLayer.y - selectedLayer.height / 2 - _onCanvaButtonSize;

      // Check if user clicked the copy button
      const handleCopyX = selectedLayer.x - selectedLayer.width / 2 - _onCanvaButtonSize;
      const handleCopyY = selectedLayer.y + selectedLayer.height / 2;

      // Check if user clicked the rotate button
      const handleRotateX = selectedLayer.x - selectedLayer.width / 2 - _onCanvaButtonSize;
      const handleRotateY = selectedLayer.y - selectedLayer.height / 2 - _onCanvaButtonSize;

      if ( // Layer
        rotatedMouseX >= handleLayerX &&
        rotatedMouseX <= handleLayerX + selectedLayer.width &&
        rotatedMouseY >= handleLayerY &&
        rotatedMouseY <= handleLayerY + selectedLayer.height
      ) {
        setIsModify("dragging");
        setDragOffset({ x: mouseX - selectedLayer.x, y: mouseY - selectedLayer.y, width: 0, height: 0 });
        return true
      } else if ( //Resize button
        rotatedMouseX >= handleResizeX &&
        rotatedMouseX <= handleResizeX + _onCanvaButtonSize &&
        rotatedMouseY >= handleResizeY &&
        rotatedMouseY <= handleResizeY + _onCanvaButtonSize
      ) {
        setIsModify("resize");
        setDragOffset({ x: rotatedMouseX - selectedLayer.x - selectedLayer.width / 2, y: rotatedMouseY - selectedLayer.y - selectedLayer.height / 2, width: 0, height: 0 });
        return true;
      } else if (//Resize width button
        rotatedMouseX >= handleResizeWidthX &&
        rotatedMouseX <= handleResizeWidthX + _onCanvaButtonSize &&
        rotatedMouseY >= handleResizeWidthY &&
        rotatedMouseY <= handleResizeWidthY + _onCanvaButtonSize
      ) {
        setIsModify("resizeWidth");
        setDragOffset({ x: rotatedMouseX - selectedLayer.x - selectedLayer.width / 2, y: 0, width: selectedLayer.width, height: 0 });
        return true;
      } else if (//Resize height button
        rotatedMouseX >= handleResizeHeightX &&
        rotatedMouseX <= handleResizeHeightX + _onCanvaButtonSize &&
        rotatedMouseY >= handleResizeHeightY &&
        rotatedMouseY <= handleResizeHeightY + _onCanvaButtonSize
      ) {
        setIsModify("resizeHeight");
        setDragOffset({ x: 0, y: rotatedMouseY - selectedLayer.y - selectedLayer.height / 2, width: 0, height: 0 });
        return true;
      } else if (//Delete button
        rotatedMouseX >= handleDeleteX &&
        rotatedMouseX <= handleDeleteX + _onCanvaButtonSize &&
        rotatedMouseY >= handleDeleteY &&
        rotatedMouseY <= handleDeleteY + _onCanvaButtonSize
      ) {
        setIsModify("delete");
        setBorderColor("red")
        return true;
      } else if (//Copy button
        rotatedMouseX >= handleCopyX &&
        rotatedMouseX <= handleCopyX + _onCanvaButtonSize &&
        rotatedMouseY >= handleCopyY &&
        rotatedMouseY <= handleCopyY + _onCanvaButtonSize
      ) {
        setIsModify("copy");
        return true;
      } else if (//Rotate button
        rotatedMouseX >= handleRotateX &&
        rotatedMouseX <= handleRotateX + _onCanvaButtonSize &&
        rotatedMouseY >= handleRotateY &&
        rotatedMouseY <= handleRotateY + _onCanvaButtonSize
      ) {
        setIsModify("rotate");
        setDragOffset({ x: rotatedMouseX, y: rotatedMouseY, width: 0, height: 0 });
        return true;
      } else if ( //Change Layer
        rotatedMouseX > selectedLayer.x &&
        rotatedMouseX < selectedLayer.x + selectedLayer.width / 2 &&
        rotatedMouseY > selectedLayer.y &&
        rotatedMouseY < selectedLayer.y + selectedLayer.height / 2
      ) {
        return true;
      };
    });

    handleMouseLayer ? setSelectedLayerId(handleMouseLayer.id) : setSelectedLayerId(selectedLayerId)
  };

  // Function to stop dragging
  const handleMouseUp = (): void => {
    isModify === "delete" && deleteLayer(selectedLayerId!)
    setBorderColor("black")
    setIsModify("all");
  };

  // Function to handle dragging only the selected layer
  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!selectedLayerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isModify === "resize") {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          // Calculate center of rotation
          const centerX = layer.x;
          const centerY = layer.y;
          // Calculate the angle of rotation in radians (replace with your actual angle)
          const angle = layer.angle // Convert degrees to radians
          // Inverse rotation calculation
          const rotatedMouseX = Math.cos(-angle) * (mouseX - centerX) - Math.sin(-angle) * (mouseY - centerY) + centerX;
          const rotatedMouseY = Math.sin(-angle) * (mouseX - centerX) + Math.cos(-angle) * (mouseY - centerY) + centerY;
          const newWidth = 2 * (rotatedMouseX - layer.x - dragOffset.x);
          const newHeight = 2 * (rotatedMouseY - layer.y - dragOffset.y);
          const newSize = (newWidth + newHeight) / (layer.width + layer.height)
          return (
            layer.id === selectedLayerId
              ? { ...layer, width: layer.width * newSize, height: layer.height * newSize }
              : layer
          )
        })
      );
    } else if (isModify === "resizeWidth") {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          // Calculate center of rotation
          const centerX = layer.x;
          const centerY = layer.y;
          // Calculate the angle of rotation in radians (replace with your actual angle)
          const angle = layer.angle // Convert degrees to radians
          // Inverse rotation calculation
          const rotatedMouseX = Math.cos(-angle) * (mouseX - centerX) - Math.sin(-angle) * (mouseY - centerY) + centerX;

          const newWidth = 2 * (rotatedMouseX - layer.x - dragOffset.x);

          return (
            layer.id === selectedLayerId
              ? { ...layer, width: newWidth }
              : layer
          )
        })
      );
    } else if (isModify === "resizeHeight") {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          // Calculate center of rotation
          const centerX = layer.x;
          const centerY = layer.y;
          // Calculate the angle of rotation in radians (replace with your actual angle)
          const angle = layer.angle // Convert degrees to radians
          // Inverse rotation calculation
          const rotatedMouseY = Math.sin(-angle) * (mouseX - centerX) + Math.cos(-angle) * (mouseY - centerY) + centerY;
          const newHeight = 2 * (rotatedMouseY - layer.y - dragOffset.y)
          return (
            layer.id === selectedLayerId
              ? { ...layer, height: newHeight }
              : layer
          )
        })
      );
    } else if (isModify === "rotate") {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {

          // Calculate the distance along the X-axis when clicking the rotate button
          const dxPlusButtonClick = dragOffset.x - layer.x + dragOffset.x - layer.width / 2 - layer.x;

          // Calculate the distance along the Y-axis when clicking the rotate button
          const dyPlusButtonClick = dragOffset.y - layer.y + dragOffset.y - layer.height / 2 - layer.y;

          // Calculate the distance between the mouse position and the layer's X-axis position
          const dx = mouseX - layer.x;
          // Calculate the distance between the mouse position and the layer's Y-axis position
          const dy = mouseY - layer.y;

          // Calculate the angle from the center of the layer to the click position (for the plus rotate)
          const newAnglePlusButtonClickAngel = Math.atan2(-dyPlusButtonClick, -dxPlusButtonClick);

          // Calculate the angle based on the mouse position relative to the layer
          const newAngle = Math.atan2(-dy, -dx);

          return (
            layer.id === selectedLayerId
              ? { ...layer, angle: newAngle - newAnglePlusButtonClickAngel }
              : layer
          )
        })
      );
    } else if (isModify === "dragging") {
      // Move the selected layer
      setLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === selectedLayerId
            ? { ...layer, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
            : layer
        )
      );
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: "gray" }}>
      <div>
        <h2>Photoshop</h2>

        <div>
          <button onClick={() => handleCanvasSizeChange('A4')}>A4 Format</button>
          <button onClick={() => handleCanvasSizeChange('A3')}>A3 Format</button>
        </div>

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ border: '1px solid red' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsModify("all")}
        >

        </canvas>
      </div>
      <div>
        <h2>Controls</h2>
        <div>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <button onClick={handleAddText}>Add Text</button>
          <button onClick={saveCanvas}>Save Canvas</button> {/* Save Canvas Button */}
        </div>

        <div>
          <h2>Layers</h2>
          <ul>
            {reverseIndex.map((layer) => (
              <li key={layer.id} onClick={() => selectLayer(layer.id)} style={{ cursor: 'pointer' }}>
                {layer.type === 'image' ? `Image ${layer.id}` : `Text: ${layer.text}`}
                <button onClick={() => moveLayerDown(layer.id)}>↓</button>
                <button onClick={() => moveLayerUp(layer.id)}>↑</button>
                <button onClick={() => deleteLayer(layer.id)}>🗑️</button> {/* Delete Button */}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Selected Layer Properties</h2>
          {selectedLayerId && layers.find(layer => layer.id === selectedLayerId)?.type === 'text' && (
            <>
              <div>
                <label>Text: </label>
                <input
                  type="text"
                  value={layers.find(layer => layer.id === selectedLayerId)?.text}
                  onChange={(e) => updateTextLayer('text', e.target.value)}
                />
              </div>
              <div>
                <label>Color: </label>
                <input
                  type="color"
                  value={layers.find(layer => layer.id === selectedLayerId)?.color}
                  onChange={(e) => updateTextLayer('color', e.target.value)}
                />
              </div>
              <div>
                <label>Font Family: </label>
                <select
                  value={layers.find(layer => layer.id === selectedLayerId)?.fontFamily}
                  onChange={(e) => updateTextLayer('fontFamily', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="button-container">
            <div className="button-row">
              <button onClick={() => moveSelectedLayer(0, -2)} style={{ marginBottom: '10px' }}>Move Up ↑</button>
            </div>
            <div className="button-row">
              <button onClick={() => moveSelectedLayer(-2, 0)} style={{ marginRight: '10px' }}>← Move Left</button>
              <button onClick={() => moveSelectedLayer(2, 0)} style={{ marginLeft: '10px' }}>Move Right →</button>
            </div>
            <div className="button-row">
              <button onClick={() => moveSelectedLayer(0, 2)} style={{ marginBottom: '-10px' }}>Move Down ↓</button>
            </div>
          </div>
          <br />
          <div>
            <button onClick={() => resizeSelectedLayer(-3.78, -3.78, -3.78)}>Resize -</button>
            <button onClick={() => resizeSelectedLayer(3.78, 3.78, 3.78)}>Resize +</button><br />
            <h3>Actual width</h3>
            {/* in mm real size imageWidth! / 3.78 * _scale;
                in mm mashtab size imageWidth! / 3.78
                in pixsel real size imageWidth! * _scale
                in pixsel mashtab size imageWidth!
            */}
            <input type="number" onChange={(e) => handleImageSizeChange(+e.target.value * 3.78 / _scale, 0, +e.target.value * 3.78 / _scale)} min="1" max="1600" defaultValue={(imageWidth! / 3.78 * _scale).toFixed(1)} />mm
            <h3>Actual height</h3>
            <input type="number" onChange={(e) => handleImageSizeChange(0, +e.target.value * 3.78 / _scale, +e.target.value * 3.78 / _scale)} min="1" max="1600" defaultValue={(imageHeight! / 3.78 * _scale).toFixed(1)} />mm
          </div>
          <div>
            <select onChange={(e) => setTextStyle(e.target.value)} value={textStyle}>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
            </select>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TshirtDesigner;
