/* src/App.js */
import './App.css'
import { useState } from 'react'
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
    var [fileUrl, updateFileUrl] = ``
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


  async App() {

    this.setState({ loading: false })
  }


  render() {
    let content
    if (this.state.loading) {
      content = <img src={'https://media.giphy.com/media/l3nWhI38IWDofyDrW/giphy.gif'}
        width="80"
        height="80" />
    }
    let fileUrl = ''

    return (
      <div className="App">
        <h>{this.state.account}<br></br></h>
        <h>{this.state.network}</h>
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
          onClick={this.onSend}
        >Send</button>

        <div id="show_img_here"></div>
        {
          fileUrl && (
            <img src={fileUrl} width="600px" height="200px" />
          )
        }
      </div>
    )


  }

}

export default App