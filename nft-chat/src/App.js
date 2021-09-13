/* src/App.js */
import './App.css'
import { useState } from 'react'
import { create } from 'ipfs-http-client'

const client = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [fileUrl, updateFileUrl] = useState(``)

  async function onSend(e) {
    let canvas = document.createElement("canvas");
    canvas.id = "canvasId";
    canvas.width = 600;
    canvas.height = 200;
    let ctx = canvas.getContext('2d');
    ctx.font = "30px Arial";
    let text = document.getElementById("the_text").value;
    console.log("the text", text);

    ctx.fillText(text, 30, 80);
    let img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    document.getElementById("show_img_here").append(img);

    let fileContent = img.src;

    let arr = fileContent.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    let file = new File([u8arr], 'filename.png', { type: mime });


    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log("new file url:", url)
      updateFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }


  return (
    <div className="App">
      <h1>IPFS Example</h1>
      <input
        id="the_text"
        type="text"
        style={{
          /* backgroundColor: "#4CAF50", Green */
          padding: "13px 50px",
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: "16px",

          width: '300px'
        }}

      />
      <button width="300" height="300" style={{
        backgroundColor: "#4CAF50", /* Green */
        border: 'none',
        color: 'white',
        padding: "15px 32px",
        textAlign: 'center',
        textDecoration: 'none',
        display: "inline-block",
        fontSize: "16px",
        margin: "4px 2px",
        cursor: "pointer",
        /* width: 35px; */
      }}
        onClick={onSend}
      >Send</button>

      <div id="show_img_here"></div>
      {
        fileUrl && (
          <img src={fileUrl} width="600px" height="200px" />
        )
      }
    </div>
  );
}

export default App