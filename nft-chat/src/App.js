/* src/App.js */
import './App.css'
import { useState } from 'react'
import { create } from 'ipfs-http-client'

const client = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [fileUrl, updateFileUrl] = useState(``)
  async function onChange(e) {
    const file = e.target.files[0]
    console.log("file", file);
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      updateFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }


  async function onTxtChange(e) {
    




    let canvas = document.createElement("canvas");
            canvas.id = "canvasId";
            canvas.width = 300;
            canvas.height = 200;
            let ctx = canvas.getContext('2d');
            ctx.font = "30px Arial";
            let text = document.getElementById("the_text").value;
            console.log("the text", text);

            ctx.fillText(text, 10, 50);
            let img = document.createElement("img");
            img.src = canvas.toDataURL("image/png");
            document.getElementById("show_img_here").append(img);
            //document.body.appendChild(canvas);
    
//console.log("img", img.src);

//let fileContent = document.getElementById("show_img_here");

let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

let fileContent = img.src;


let arr = fileContent.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    let file = new File([u8arr], 'filename.png', {type:mime});




    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      
      updateFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
    
  }


  return (
    <div className="App">
      <h1>IPFS Example</h1>
      <input
        type="file"
        onChange={onChange}
      />
      <input
        id="the_text"
        type="text"
        
      />
      <button
      width="300"
      height="300"
      onClick={onTxtChange}
      />
      <div id="show_img_here"></div>
      <canvas width="600" height="400"></canvas>
      {
        fileUrl && (
          <img src={fileUrl} width="600px" eight="400px"/>
        )
      }
    </div>
  );
}

export default App