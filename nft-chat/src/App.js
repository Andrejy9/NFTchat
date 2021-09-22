/* src/App.js */
import './App.css'
import { create } from 'ipfs-http-client'
import html2canvas from 'html2canvas'
import Web3 from 'web3'
import Contract from 'web3-eth-contract'
import React, { Component } from 'react'
import { NFTchatABI } from "./NFTChatABI";
import { getMetaData } from "./NFTMetadata";

const client = create('https://ipfs.infura.io:5001/api/v0')
//OLD const CONTRACT_ADDRESS = '0xf1bCaD175dFac737daC5fC7176C516D91126f0Cb'
const CONTRACT_ADDRESS = '0xB7b67863EfDC1a1e556D1E59efee52b5260CCC40'
const NFTContract = new Contract(NFTchatABI, CONTRACT_ADDRESS)
let web3;
let account;
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      show: false,
      network: '',
      MetamaskInstalled: false
    }
  }

  //lifecycle function componenet
  async componentDidMount() {
    await this.loadWeb3()
    if (this.state.show === false) {
      await this.loadBlockchainData()
          // detect Network account change
    window.ethereum.on('chainChanged', function(networkId){
     console.log('networkChanged',networkId)
     window.location.reload();
    });
    }
  }

  async loadBlockchainData() {
    await window.web3.currentProvider.enable();
    web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.getAccounts()
    account = accounts[0]
    this.setState({ account: account })
    this.detectNetwork(web3)
  }

  //detect the Network 
  async detectNetwork(web3) {

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
          case 56:
          console.log('This is Binance Smart Chain')
          this.setState({ network: 'BSC' })
          break
        default:
          console.log('This is an unknown network.')
          this.setState({ network: 'Unsupported' })
          window.alert('Unsupported Network')
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
      this.setState({ MetamaskInstalled: true })
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      this.setState({ show: true })
    }
  }

  async onTxtChanged(e) {
    let theText = e.target.value;
    const htmlText = theText
      .replace(/\t/g, '    ')
      .replace(/ {2}/g, '&nbsp; ')
      .replace(/ {2}/g, ' &nbsp;')
      .replace(/\n\r?/g, '<br>');

    let msgPreview = document.getElementById('msgPreview');
    msgPreview.innerHTML = htmlText;
  }

  async onSend(e) {
    const toAddress = document.getElementById('toAddress').value;
    if (web3.utils.isAddress(toAddress)) {
      console.log("sending msg...")
      const msgPreview = document.getElementById('previewContainer');

      html2canvas(msgPreview).then(
        function (canvas) {
          uploadDataToIPFS(canvas.toDataURL("image/png")).then((fileUrl) => { mintNFT(fileUrl, toAddress) })
        })
    } else {
      alert("Invalid receiver address")
    }
  }

  async App() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <div className="App">
        {<pre className="Title">
          <h1 >
            ███    ██ ███████ ████████      ██             ██<br></br>
            ████   ██ ██         ██         ██           ██████<br></br>
            ██ ██  ██ █████      ██   █████ ██████ █████   ██  <br></br>
            ██  ██ ██ ██         ██  ██     ██  ██ ██  ██  ██  <br></br>
            ██   ████ ██         ██   █████ ██  ██ ███ ███ ████<br></br>
          </h1>
        </pre>}
        <input id="toAddress" className="ToAddress" maxLength="42" placeholder="Paste the receiver address here..."></input>
        <textarea className="TextArea" id="the_text" maxLength="666" spellCheck="false" placeholder="Write your message here..." onChange={this.onTxtChanged} />
        <div id="previewContainer">
          <div id="msgPreview">  -- NFT message preview --  </div>
        </div>
        <div className="container">
          <div className="clientInfo">
            <b>Sender Address:</b> {this.state.account}
            <br></br>
            <b>Network:</b> {this.state.network}
          </div>
          <button className="MyButton" onClick={this.onSend}>Send</button>
        </div>
      </div>
    )
  }
}

export default App


async function uploadDataToIPFS(imageURL) {
  const imgFile = getImageFile(imageURL)
  const imgUrl = await uploadFileToIPFS(imgFile)
  const metadata = getMetaData(imgUrl, account, Date.now())
  const metaJson = JSON.stringify(metadata)
  const metadataFile = new File([metaJson], 'metadata.json', { type: 'text/plain;charset=UTF-8' })
  const fileUrl = await uploadFileToIPFS(metadataFile)
  console.log("IPFS File URL:", fileUrl)
  return fileUrl;
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
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
  return fileUrl
}

async function mintNFT(fileURI, toAddress) {
  const nonce = await web3.eth.getTransactionCount(account, 'latest');
  //the transaction
  const tx = {
    'from': account.toString(),
    'to': CONTRACT_ADDRESS,
    'nonce': nonce.toString(),
    //TODO define gas for different blockchains
    'gas': '200000',
    //TODO define maxPriorityFeePerGas
    'maxPriorityFeePerGas': '2000000',
    'data': NFTContract.methods.mint(toAddress, fileURI).encodeABI()
  };

  console.log(tx)

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [tx],
  });
  console.log("Transaction hash:", txHash)
}