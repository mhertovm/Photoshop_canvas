import Image from "next/image";
import styles from "./page.module.css";
import TshirtDesigner from '../components/TshirtDesigner';
import TshirtDesignerw from "@/components/hincanva";
import App from '../pages/App'

export default function Home() {
  return (
    <main >
      <TshirtDesigner />
      <TshirtDesignerw />
    </main>
  );
}
//==================================================================
// const drawOnCanvaButtonForText = (layer: Layer, ctx: CanvasRenderingContext2D) => {
//   ctx.fillStyle = 'red';
//   ctx.fillRect(
//     layer.x - _onCanvaButtonSize / 2,
//     layer.y - layer.fontSize! - _onCanvaButtonSize / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );
//   ctx.fillRect(
//     layer.x + layer.width! - _onCanvaButtonSize / 2,
//     layer.y - layer.fontSize! / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );

//   ctx.fillRect(
//     layer.x + layer.width! - _onCanvaButtonSize / 2,
//     layer.y + _onCanvaButtonSize / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );

//   ctx.fillRect(
//     layer.x + layer.width! / 2 - _onCanvaButtonSize / 2,
//     layer.y + _onCanvaButtonSize / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );

//   ctx.fillRect(
//     layer.x - _onCanvaButtonSize / 2,
//     layer.y + _onCanvaButtonSize / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );

//   ctx.fillRect(
//     layer.x + layer.width! - _onCanvaButtonSize / 2,
//     layer.y - layer.fontSize! - _onCanvaButtonSize / 2,
//     _onCanvaButtonSize,
//     _onCanvaButtonSize
//   );
// }

// ctx.save(); // Save the current state
//============================================================================================================
// const drawTextWithSpacing = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, letterSpacing: number) => {
//   let currentX = x;
//   let currentY = y;
//   for (let i = 0; i < text.length; i++) {
//     const char = text[i];
//     ctx.fillText(char, currentX, y, 1);
//     currentX += ctx.measureText(char).width + letterSpacing;
//     currentY += ctx.measureText(char).width + letterSpacing;
//   }
// };
// Draw layers

//========================================================================
// const rect = canvas.getBoundingClientRect();
// const x = e.clientX - rect.left;
// const y = e.clientY - rect.top;
// console.log(mouseX, mouseY, "==", rect.width, rect.height, '==', rect.left, rect.top, rect.right, rect.bottom);
//======================================================================
// const angle = selectedLayer.angle * (Math.PI / 180); // Convert degrees to radians
//==========================================================================