/* src/App.js */
import './App.css'
import { create } from 'ipfs-http-client'
import html2canvas from 'html2canvas'
import Web3 from 'web3'
import React, { Component } from 'react'
import { NFTchatABI } from "./NFTChatABI";

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
    let div = document.getElementById('the_text');
    html2canvas(div).then(
      function (canvas) {
        canvas.setAttribute("class", "myCanvas");
        document
          .getElementById('show_img_here')
          .appendChild(canvas);
        uploadDataToIPFS(canvas.toDataURL("image/png"))
      })
  }

  async App() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <div className="App">
        <h>{this.state.account}<br></br></h>
        <h>{this.state.network}</h>
        <h1>NFTchat</h1>

        <textarea className="TextArea" id="the_text" cols="10" rows="10" placeHolder="Comment text..." />
        <button className="MyButton" onClick={this.onSend}>Send</button>
        <div className="imgPreview" id="show_img_here"></div>

      </div>
    )
  }
}

export default App


async function uploadDataToIPFS(imageURL) {
  console.log("imageURL", imageURL);
  const imgFile = getImageFile(imageURL)
  const imgUrl = await uploadFileToIPFS(imgFile)

  //Upload Metadata
  const metadata = getMetaData(imgUrl)
  const metaJson = JSON.stringify(metadata)
  const metadataFile = new File([metaJson], 'metadata.json', { type: 'text/plain;charset=UTF-8' })
  uploadFileToIPFS(metadataFile)

  const NFTContract = new window.web3.eth.Contract(NFTchatABI)
  //console.log("NFTContract: ", NFTContract)
  //console.log("NFTchatABI: ", NFTchatABI)


  const contractAddress = '0xf1bCaD175dFac737daC5fC7176C516D91126f0Cb'
}

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



function getMetaData(imgUrl, senderAdress) {
  return {
    "name": "nftchat.xyz",
    "description": `You received this message from: ${senderAdress}`,
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
