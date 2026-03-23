import { useState } from 'react'
import './App.css'


function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [ascii, setaAscii] = useState('')
  const DISPLAY_COLS = 180;

  const cvtToAscii = (file) => {
    // const gscale = '█▓▒░ ';
    const gscale = '@%#*+=-:. ';
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const cols = DISPLAY_COLS;
      const rows = Math.floor(cols * (img.height / img.width) * 0.6);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = cols;
      canvas.height = rows;
      ctx.drawImage(img, 0, 0, cols, rows);

      const imgData = ctx.getImageData(0,0, cols, rows);
      const pixels = imgData.data;

      let asciiTxt = '';
      for(let i=0; i<pixels.length; i+=4) {
        const r = pixels[i];
        const g = pixels[i+1];
        const b = pixels[i+2];
        const avg = (r+g+b) / 3;
        const charIndex = Math.floor(((255-avg)/255) * (gscale.length - 1));
        asciiTxt += gscale[charIndex];
        if ((i/4 + 1) % cols === 0) {
          asciiTxt += '\n';
        }
      }
      setaAscii(asciiTxt);
    };
  }

  return (
    <>
      <div>
        <h1>Image To Ascii Converter</h1>
        <input type="file" accept="image/*" className="file" onChange={(e) => {
          setUploadedFile(e.target.files[0])
          cvtToAscii(e.target.files[0])}} />
        <div className="container">
          <div className="originalImage image-container">
            <h2>Original Image</h2>
            {uploadedFile && <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded Image" className="uploaded-img" />}
          </div>
          <div className="asciiImage image-container ascii">
            <h2>ASCII Art</h2>
            <pre>
              {ascii}
            </pre>
          </div>
        </div>
      </div>
    </>
  )
  }


export default App;