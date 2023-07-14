<template>
  <div class="hello"> 
    <div class="container">
       <b-button class="mt-4 mb-2" variant="primary" @click="connectMetamask" style="float:right;">{{
              address ? address : "Connect Metamask"
            }}</b-button>
   <b-card class="custom-card">
    <b-tabs>
      <b-tab
      title="Profile">
      <div class="mt-2 text-center" v-if="didDoc">             
                    <div class="form-group row pt-4">
            <label class="col-sm-2 col-form-label"><strong>DID:</strong></label>             
              <div style="text-align:center; justify-content: center;" class="didbox pt-2">{{didDoc.id}}</div>
          </div>
        <a
          class="pt-2"          
          :href="`https://explorer.hypersign.id/hypersign-testnet/identity/${didDoc.id}`"
          target="_blank"
          >Click to see your DID Document</a
        >
        </div>
        <b-card
        v-if="didDoc"
        class="mt-4">
        <div class="text-left">
          <h4><strong> Your EDV Config </strong></h4>        
          <div class="form-group row pt-4">
            <label class="col-sm-2 col-form-label"><strong>EDV ID:</strong></label>
            <div class="col-sm-10 d-flex align-items-center">
              <p class="mb-0">hs:edv:{{didDoc.id}}</p>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-2 col-form-label"><strong>Controller:</strong></label>
            <div class="col-sm-10 d-flex align-items-center">
              <p class="mb-0">{{didDoc.id}}</p>
            </div>
          </div> 
        </div>
        <div class="text-right">
        <!-- <b-button variant="primary" @click="fetchAllVcFn">Fetch Your Documents</b-button> -->
        </div>
        </b-card>
      </b-tab>
      <b-tab
      title="Game">
      <b-card class="mt-4">
          <h4 class="text-left"><strong> Play your Game </strong></h4>          
          <p>Level</p><v-stepper :steps="steps" v-model="step"></v-stepper>
          <div class="mt-4">
          <b-button variant="primary" @click="start">Start Playing</b-button>
          <b-button class="ml-2" variant="primary" @click="reset">Reset</b-button>
          </div>
          <div class="row mt-4 ml-4" v-if="isStarted"> 
            <p>Score: {{score}}</p>           
              <div class="box" @mousemove="increaseScore">
                Move your cursor inside this box to increase the score!
              </div>              
            </div>
            <p class="mt-2">OR</p>
              <b-button variant="primary" @click="importScore">Import Score Credential</b-button>
        </b-card>
      </b-tab>      
    </b-tabs>                        
   </b-card>
    </div>  
    <hf-pop-up Header="Verifiable Presentation is Verified" Id="verified-vp" Size="xl">    
      <h4>Congrats You crossed level 1</h4>  
      <json-viewer
        :value="vpResult"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>          
    </hf-pop-up>
  </div>
</template>

<script>
import {HypersignDID,HypersignVerifiablePresentation} from "hs-ssi-sdk"
import {HypersignEdvClientEcdsaSecp256k1} from "@hypersign-protocol/hypersign-vault-client";
import {VStepper} from "vue-stepper-component"
import loadweb3 from "../utils/web3Instance"
import toast from "../utils/toast"
import {  truncate } from "../utils/hsConstants"
import multibase from "multibase";
import { Buffer } from "buffer";
import HfPopUp from "../elements/hfPopUp.vue"
import {HIDNODE_NAMESPACE,HIDNODE_REST,HIDNODE_RPC} from "../utils/hsConstants"
window.Buffer = Buffer;
export default {
  name: 'VerifierPage',
  components:{VStepper,HfPopUp},
  data(){
    return{
      vpResult:null,
      isStarted:false,
      steps:4,
      step:1,
      level:1, 
      score:0,
      userPublicKeyMultibase:'',
      address:'',
      didDoc:null,
      publicKeyMultibase:'',
      edvClient:null,
      hypersignDID:null,
      fetchEncryptedCred:[],
      showDecryptedCred:null,
      keyAgreementKeyPair:{},
      hypersignVP:null,      
      }

  },
  async mounted(){
     const namespace = "testnet";
    this.hypersignDID = new HypersignDID({ namespace });
    console.log(this.hypersignDID)
    this.hypersignVP = new HypersignVerifiablePresentation({
      nodeRestEndpoint: HIDNODE_REST,
      nodeRpcEndpoint: HIDNODE_RPC,
      namespace:HIDNODE_NAMESPACE,
    })
  },
  methods:{
    start(){
      this.isStarted = true
    },  
    async verify(){
      const params = {
      credential: this.showDecryptedCred,
      issuerDid: this.showDecryptedCred.issuer,
      verificationMethodId:this.showDecryptedCred.proof.verificationMethod,
    };
    console.log(params)
      const verificationResult = await this.hypersignVC.verify(params);
      console.log(verificationResult)
      return verificationResult
    },
    reset(){
      this.score = 0
      this.step = 1
    },
    increaseScore(){
      if(this.score<=100){
        this.level = 1
        this.step = 2             
        // this.$root.$emit("bv::show::modal", "level-cross-popup"); 
      }if(this.score>=100 && this.score<=200){
        this.step = 3       
      }if(this.score>=200){
        this.step = 4      
      }
      this.score +=1;   
    },
     async connectMetamask() {
      const web3 = await loadweb3(1);
      window.web3 = web3
      const accounts = await web3.eth.getAccounts();      
      const publicKey = await window.ethereum.request({ method: 'eth_getEncryptionPublicKey', params: [accounts[0]] });
      this.userPublicKeyMultibase=publicKey      
      this.address = accounts[0];
      await this.generateDiD()
    },
    async fetchAllVcFn(){
      try {
        if(!this.didDoc){
          throw new Error('Connect Metamask in DID tab')
        }
        const allVc = await this.edvClient.fetchAllDocs({
        edvId: `hs:edv:${this.didDoc.id}`
      })      
      this.fetchEncryptedCred = allVc      
      } catch (error) {
        this.toast(error,'error')
      }     
    },
     async generateDiD() {      
      const genDiD = await this.hypersignDID.createByClientSpec({
        methodSpecificId: this.address,        
        chainId: "0x1",
        clientSpec: "eth-personalSign",
        address: this.address,
      });      
      this.didDoc = genDiD;         
      const verificationMethod = {
        id: this.didDoc.id+'#'+`eip155:1:${this.address}`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: this.didDoc.id,
        blockchainAccountId: `eip155:1:${this.address}`,
    }        
      this.publicKeyMultibase=this.base64toMultibase58(this.userPublicKeyMultibase)
      this.keyAgreementKeyPair = {
        id: this.didDoc.id+'#'+this.publicKeyMultibase,
        type: 'X25519KeyAgreementKeyEIP5630',
        controller: this.didDoc.id,
        publicKeyMultibase:this.publicKeyMultibase,
    }    
      this.edvClient = new HypersignEdvClientEcdsaSecp256k1({
        url:'https://stage.hypermine.in/vault',
        keyAgreement:this.keyAgreementKeyPair,        
        verificationMethod
      })    
      const config = {
        edvId:`hs:edv:${this.didDoc.id}`,
        verificationMethod: verificationMethod,
        keyAgreement:this.keyAgreementKeyPair
      }      
      await this.edvClient.registerEdv(config)     
    },
    async importScore(){
      if(this.didDoc===null){
        return this.toast('Connect Metamask','error')
      }
       const query=await this.edvClient.Query({
            edvId: `hs:edv:${this.didDoc.id}`,
            equals:[
            { 'content.credentialSchema.id':'sch:hid:testnet:zufjU7LuQuJNFiUpuhCwYkTrakUu1VmtxE9SPi5TwfUB:1.0'
            }]
            // has:['content.data']            
        })
        console.log(query)            
      const res = await this.decryptVc(query[0])
      console.log(res)            
      const verifyResult = await this.presentCred()      
      const result = await this.hypersignVP.verifyByClientSpec({
        signedPresentation:verifyResult,
        challenge:'1223121',
        domain:'www.hypersign.id',
        issuerDid:this.showDecryptedCred.issuer,
        holderDid:this.didDoc.id,
        holderVerificationMethodId:this.didDoc.verificationMethod[0].id,
        issuerVerificationMethodId:this.showDecryptedCred.issuer+"#key-1",
        web3Obj:window.web3
      })
      console.log(result)
      this.vpResult=result
      if(result.verified){
        this.$root.$emit("bv::show::modal", "verified-vp"); 
        this.score +=10;
        this.step = 2
      }      

    },
    async presentCred(){
      const presentation = await this.hypersignVP.generate({
        verifiableCredentials:[this.showDecryptedCred],
        holderDid:this.didDoc.id,        
      })
      console.log(presentation)
      const vp = await this.hypersignVP.signByClientSpec({
        presentation,
        holderDid:this.didDoc.id,
        verificationMethodId:this.didDoc.verificationMethod[0].id,
        web3Obj:window.web3,
        challenge:'1223121',
        domain:'www.hypersign.id'
      })      
      console.log(vp)
      return vp
    },
    async decryptVc(encCred){
      console.log(encCred)
      this.showDecryptedCred = null
      try {
        const decryptDoc = await this.edvClient.decryptDocument({
          encryptedDocument:encCred.encryptedData,
          recipient:{
              id: this.keyAgreementKeyPair.id,
              type: 'X25519KeyAgreementKeyEIP5630'
          }
        })      
        console.log(decryptDoc)
      this.showDecryptedCred = decryptDoc.content
      return this.showDecryptedCred      
      } catch (error) {
        this.toast(error,'error')
      }     
    },
     base64toMultibase58(base64) {
      const buffer = Buffer.from(base64, 'base64');
      const base58 = multibase.encode('base58btc', buffer);      
      return Buffer.from(base58).toString();
    },    
  },
    truncate1(str, number) {
    console.log(str,number)
      return truncate(str, number);
    },
    mixins: [toast]
}
</script>
<style scoped>
.box {
      width: 300px;
      height: 300px;
      border: 1px solid black;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
.didbox{  
  padding: auto;
  text-align: center;
  justify-content: center;
  width: 50rem;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  text-align: center;
}
.blink {
  animation: blink 1s infinite;
}
.selected-media-wrapper {
  border: 1px dashed;
  max-height: 100px;
  background-color: #f5f5f5;
  border-radius: 10px;
}
.custom-card {
  width: 100%;
}
.didDocContainer {
  background: wheat;
  border-radius: 5px;
  margin-top: 2%;
  padding: 2%;
  text-align: left;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
