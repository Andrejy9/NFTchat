/* src/App.js */
import './App.css'
import { create } from 'ipfs-http-client'
import html2canvas from 'html2canvas'
import Web3 from 'web3'
import React, { Component } from 'react'
import { NFTchatABI } from "./NFTChatABI1";
import { getMetaData } from "./NFTMetadata";

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
  async componentDidMount() {
    await this.loadWeb3()
    if (this.state.show === false) {
      await this.loadBlockchainData()
    }
  }

  async loadBlockchainData() {
    await window.web3.currentProvider.enable();
    const web3 = new Web3(window.web3.currentProvider);
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
        case 80001:
          console.log('This is the Mumbai testnet.')
          this.setState({ network: 'Mumbai' })
          break
        default:
          console.log('This is an unknown network.')
          console.log(netId)
      }
    })

  }

  async loadWeb3() {
    console.log('loading web3...')
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

  async onTxtChanged(e) {
    let theText = e.target.value;
    const htmlText = theText
    .replace(/\t/g, '    ')
    .replace(/  /g, '&nbsp; ')
    .replace(/  /g, ' &nbsp;')
    .replace(/\n\r?/g, '<br>');

    let msgPreview = document.getElementById('msgPreview');
    msgPreview.innerHTML = htmlText;
  }

  async onSend(e) {
    console.log("sending msg")
    const msgPreview = document.getElementById('msgPreview');
    html2canvas(msgPreview).then(
      function (canvas) {
        canvas.setAttribute("class", "myCanvas");
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
        { <pre className="Title">
          <h1 >
            ███    ██ ███████ ████████      ██             ██<br></br>
            ████   ██ ██         ██         ██           ██████<br></br>
            ██ ██  ██ █████      ██   █████ ██████ █████   ██  <br></br>
            ██  ██ ██ ██         ██  ██     ██  ██ ██  ██  ██  <br></br>
            ██   ████ ██         ██   █████ ██  ██ ███ ███ ████<br></br>
          </h1>
        </pre> }
        <textarea className="TextArea" id="the_text" maxlength="666" spellcheck="false" placeHolder="Write your message here..." onChange={this.onTxtChanged}/>
        <div id="msgPreview">Here you will see a preview of your NFT message</div>
        <button className="MyButton" onClick={this.onSend}>Send</button>
      </div>
    )
  }
}

export default App


async function uploadDataToIPFS(imageURL) {
  const imgFile = getImageFile(imageURL)
  const imgUrl = await uploadFileToIPFS(imgFile)

  //Upload Metadata
  const metadata = getMetaData(imgUrl)
  const metaJson = JSON.stringify(metadata)
  const metadataFile = new File([metaJson], 'metadata.json', { type: 'text/plain;charset=UTF-8' })
  const fileUrl = await uploadFileToIPFS(metadataFile)

  //const contractAddress = '0xf1bCaD175dFac737daC5fC7176C516D91126f0Cb'

  //contratto creato con function public
  const contractAddress = '0x0B46E5135b37ADD119c4dA02a74Fce00260092D8'


  await window.web3.currentProvider.enable();
  var web3 = new Web3(window.web3.currentProvider);
  const accounts = await web3.eth.getAccounts()
  var account=accounts[0]

  var Contract = require('web3-eth-contract');
  Contract.setProvider(window.web3.providers);
  const NFTContract = new Contract(NFTchatABI, contractAddress)

  //console.log("NFTContract: ", NFTContract)
  //console.log("NFTchatABI: ", NFTchatABI)


  async function mintNFT(tokenURI, account, NFTContract) {
    const nonce = await window.web3.eth.getTransactionCount(account, 'latest'); //get latest nonce
    console.log(nonce)
  
    //the transaction
    const tx = {
      'from': account.toString(),
      'to': contractAddress,
      'nonce': nonce.toString(),
      //da calcolare in qualche modo il gas
      'gas': '500000',
      //questo valore l'ho messo a caso ma così funziona
      'maxPriorityFeePerGas': '1999999987',
      //bisogna cambiare il nr dell'NFT perchè se è sempre lo stesso non passa la tx
      'data': NFTContract.methods.mint(account, 777777, tokenURI).encodeABI()
    };

    console.log(tx)

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx],
    });

    console.log(txHash)

  }

  console.log(fileUrl)

  await mintNFT(fileUrl,account, NFTContract)
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