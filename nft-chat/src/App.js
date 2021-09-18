/* src/App.js */
import './App.css'
import { create } from 'ipfs-http-client'
import Web3 from 'web3'
import React, { Component } from 'react'

const client = create('https://ipfs.infura.io:5001/api/v0')
class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      show: false,
      network: ''
    }
  }

  //lifecycle function componenet
  async componentWillMount() {
    await this.loadWeb3()
    if (this.state.show === false) {
      await this.loadBlockchainData()
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log(accounts[0])
    web3.eth.net.getId().then(netId => {
      switch (netId) {
        case 1:
          console.log('This is mainnet')
          this.setState({ network: 'Mainnet' })
          break
        case 2:
          console.log('This is the deprecated Morden test network.')
          break
        case 137:
          console.log('This is the Polygon network.')
          this.setState({ network: 'Polygon' })
          break
        default:
          console.log('This is an unknown network.')
          console.log(netId)
      }
    })

  }

  async loadWeb3() {
    console.log('load web sta funzionando')
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async onSend(e) {
    let canvas = document.createElement("canvas");
    canvas.id = "canvasId";
    canvas.width = 600;
    canvas.height = 200;
    let ctx = canvas.getContext('2d');
    ctx.font = "20px Courier New";
    ctx.fontFamily = "'Courier New', monospace;"
    let text = document.getElementById("the_text").value;
    ctx.fillText(text, 30, 80);

    let img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    document.getElementById("show_img_here").append(img);

    const imgFile= getImageFile(img.src);
    const imgUrl = await uploadFileToIPFS(imgFile);

    //Upload Metadata
    const metadata = getMetaData(imgUrl);
    const metaJson = JSON.stringify(metadata);
    const metadataFile = new File([metaJson], 'metadata.json', { type: 'text/plain;charset=UTF-8' });
    console.log("FILE METADATA", metadataFile);
    uploadFileToIPFS(metadataFile);
  }

  async App() {
    this.setState({ loading: false })
  }


  render() {
    return (
      <div className="App">
        <h>{this.state.account}<br></br></h>
        <h>{this.state.network}</h>
        <h1>IPFS Example</h1>

        <textarea
          id="the_text"
          value={this.state.textAreaValue}
          onChange={this.handleChange}
          rows={5}
          cols={5}
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
          onClick={this.onSend}
        >Send</button>

        <div id="show_img_here"></div>
      </div>
    )


  }

}

export default App

function getImageFile(fileContent) {
  const arr = fileContent.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  const imgFile = new File([u8arr], 'filename.png', { type: mime })
  return imgFile;
}

async function uploadFileToIPFS(file) {
  let fileUrl;
  try {
    const added = await client.add(file)
    fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`
    console.log("File url:", fileUrl)
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
  return fileUrl
}

function getMetaData(imgUrl) {
  return {
    "name": "Powered by NFT Chat",
    "description": "We gotta decide what to write here, the msg it self?, adds?, Our Marketing msg?",
    "image": `${imgUrl}`,
    "attributes": [{
      "trait_type": "Base",
      "value": "Starfish"
    },
    {
      "trait_type": "Eyes",
      "value": "Big"
    },
    {
      "trait_type": "Level",
      "value": 5
    },
    {
      "trait_type": "Stamina",
      "value": 1.4
    },
    {
      "trait_type": "Personality",
      "value": "Sad"
    },
    {
      "display_type": "boost_number",
      "trait_type": "Aqua Power",
      "value": 40
    },
    {
      "display_type": "boost_percentage",
      "trait_type": "Stamina Increase",
      "value": 10
    },
    {
      "display_type": "number",
      "trait_type": "Generation",
      "value": 2
    },
    {
      "display_type": "date",
      "trait_type": "birthday",
      "value": 8566360800 //Thing about this
    },
    {
      "value": "Simple property"
    }
    ]
  }
}
