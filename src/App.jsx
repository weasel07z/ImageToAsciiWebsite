import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [ascii, setaAscii] = useState('')
  const [gscale, setGscale] = useState('@%#*+=-:. ');
  const imgRef = useRef(null);

  const cvtToAscii = (file) => { 
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const imgContainer = imgRef.current;
      console.log(img.width, img.height);
      const cols = Math.floor(0.279855072464 * imgContainer.width); // 0.279855072464 was manually calculated to make the ascii art match the original image dimensions as closely as possible
      console.log("cols: ", cols);
      const rows = Math.floor(cols * (img.height / img.width) * 0.6);
      
      console.log(imgContainer.width, imgContainer.height);

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

  useEffect(() => {
    console.log();
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (uploadedFile) {
          cvtToAscii(uploadedFile);
        }
      }, 50);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [uploadedFile]);

  const downloadAscii = () => {
    const blob = new Blob([ascii], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const ele = document.createElement('a');
    ele.href = href;
    ele.download = uploadedFile.name.split('.').slice(0, -1).join('.') + '_Ascii.txt';
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);
    URL.revokeObjectURL(href);
  }

  const changeGscale = (self, newScale) => {
    setGscale(newScale);
    for(const item of document.querySelectorAll('.item')) {
      item.classList.remove('selected');
    }
    self.classList.add('selected');
  }

  useEffect(() => {
    if (uploadedFile) {
      cvtToAscii(uploadedFile);
    }
  }, [gscale]);

  return (
    <>
      <div>
        <h1>Image To Ascii Converter</h1>
        <div className="container">
          <h2>Upload an Image:</h2>
          <input type="file" accept="image/*" className="file" onChange={(e) => {
            setUploadedFile(e.target.files[0])
            cvtToAscii(e.target.files[0])}} />
        </div>
        
        <div className="container">
          <div className="originalImage image-container" id="img-container">
            <h2>Original Image</h2>
            {uploadedFile && <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded Image" className="uploaded-img" id="uploaded-img" ref={imgRef}/>}
          </div>
          <div className="asciiImage image-container ascii">
            <h2>ASCII Art</h2>
            <pre>
              {ascii}
            </pre>
            <button onClick={downloadAscii}>Download Ascii Art</button>
          </div>
        </div>
        <div className="grid-container">
            <h2>Change Grayscale:</h2>
            <div className="grid">
              <div className="item selected" onClick={(e) => changeGscale(e.target, '@%#*+=-:. ')}> @%#*+=-:. </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '█▓▒░ ')}>█▓▒░ </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '█▓@&%$#8X/*!;:=~^,_:-.` ')}>█▓@&%$#8X/*!;:=~^,_:-.` </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '$&%8?*=-~+"` ')}> $&%8?*=-~+"` </div>
              <div className="item" onClick={(e) => changeGscale(e.target, ' ░▒▓█')}> ░▒▓█ </div>
              <div className="item" onClick={(e) => changeGscale(e.target, ' .:-=+*#%@')}> .:-=+*#%@</div>
            </div>
        </div>
      </div>
    </>
  )
  }


export default App;