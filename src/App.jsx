import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const defaultImageURL = '/bad_apple_video.mp4';
  const [fileUrl, setFileUrl] = useState(defaultImageURL);
  const [ascii, setaAscii] = useState('');
  const [gscale, setGscale] = useState('█▓@&%$#8X/*!;:=~^,_:-.` ');
  const gscaleRef = useRef(null);
  const animRef = useRef(null);
  const imgRef = useRef(null);
  

  const cvtToAscii = (file) => { 
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const imgContainer = imgRef.current;
      const cols = Math.floor(0.279855072464 * imgContainer.width); // 0.279855072464 was manually calculated to make the ascii art match the original image dimensions as closely as possible
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
        const scale = gscaleRef.current;
        const charIndex = Math.floor(((255-avg)/255) * (scale.length - 1));
        asciiTxt += scale[charIndex];
        if ((i/4 + 1) % cols === 0) {
          asciiTxt += '\n';
        }
      }
      setaAscii(asciiTxt);
    };
  }

  const processVideo = () => {
    const video = imgRef.current;
    if(!video) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const renderFrame = () => {
      if(!video.videoWidth){
        animRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const cols = Math.floor(0.279855072464 * video.clientWidth); // 0.279855072464 was manually calculated to make the ascii art match the original image dimensions as closely as possible
      const rows = Math.floor(cols * (video.videoHeight / video.videoWidth) * 0.6);
      canvas.width = cols;
      canvas.height = rows;
      ctx.drawImage(video, 0, 0, cols, rows);
      const pixels = ctx.getImageData(0,0, cols, rows).data;
      let asciiTxt = '';
      for(let i=0; i<pixels.length; i+=4) {
        const r = pixels[i];
        const g = pixels[i+1];
        const b = pixels[i+2];
        const avg = (r+g+b) / 3;
        const scale = gscaleRef.current;
        const charIndex = Math.floor(((255-avg)/255) * (scale.length - 1));
        asciiTxt += scale[charIndex];
        if ((i/4 + 1) % cols === 0) {
          asciiTxt += '\n';
        }
      }
      setaAscii(asciiTxt);
      animRef.current = requestAnimationFrame(renderFrame);
    }
    if(animRef.current) {cancelAnimationFrame(animRef.current)}
    renderFrame();
  }

  const processImage = (file) => {
    cvtToAscii(file);
  }

  useEffect(() => {
    console.log();
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (uploadedFile) {
          processImage(uploadedFile);
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

  useEffect(() => {
    gscaleRef.current = gscale;
  }, [gscale]);

  useEffect(() => {
    fetch(defaultImageURL)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'bad_apple_video.mp4', { type: 'video/mp4' });
        setUploadedFile(file);
        setFileUrl(URL.createObjectURL(file));
        setTimeout(() => processImage(file), 50);
      });
  }, []);

  return (
    <>
      <div>
        <h1>Image/Video To Ascii Converter</h1>
        <div className="container">
          <h2>Upload an Image or Video:</h2>
          <input type="file" accept="image/*, video/*" className="file" onChange={(e) => {
            if(animRef.current) {cancelAnimationFrame(animRef.current)}

            setUploadedFile(e.target.files[0])
            setFileUrl(URL.createObjectURL(e.target.files[0]))

            if(e.target.files[0].type.startsWith('image/')) {processImage(e.target.files[0])}
            }} />
        </div>
        
        <div className="container">
          <div className="originalImage image-container" id="img-container">
            {uploadedFile?.type.startsWith('video/') ? <h2>Original Video</h2> : <h2>Original Image</h2>}
            {uploadedFile && uploadedFile?.type.startsWith('video/') && <video src={fileUrl} controls autoPlay loop muted className="uploaded-img" id="uploaded-img" onLoadedData={processVideo} ref={imgRef}/>}
            {uploadedFile && uploadedFile?.type.startsWith('image/') && <img src={fileUrl} alt="Uploaded Image" className="uploaded-img" id="uploaded-img" ref={imgRef}/>}
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
              <div className="item" onClick={(e) => changeGscale(e.target, '@%#*+=-:. ')}> @%#*+=-:. </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '█▓▒░ ')}> █▓▒░ </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '█ ')}> █ </div>
              <div className="item selected" onClick={(e) => changeGscale(e.target, '█▓@&%$#8X/*!;:=~^,_-.` ')}> █▓@&%$#8X/*!;:=~^,_-.` </div>
              <div className="item" onClick={(e) => changeGscale(e.target, '@&%$#8X/*!;:=~^,_-.` ')}> @&%$#8X/*!;:=~^,_-.`  </div>
              <div className="item" onClick={(e) => changeGscale(e.target, ' ░▒▓█')}> ░▒▓█ </div>
              <div className="item" onClick={(e) => changeGscale(e.target, ' .:-=+*#%@')}> .:-=+*#%@</div>
              <div className="item" onClick={(e) => changeGscale(e.target, ' `.-_,^~=:;!*/X8#$%&@▓█')}> `.-_,^~=:;!*/X8#$%&@▓█` </div>
            </div>
        </div>
      </div>
    </>
  )
  }


export default App;