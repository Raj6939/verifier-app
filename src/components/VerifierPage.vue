<template>
  <div class="hello">
    <h1>Game 2</h1>
    <div class="container d-flex">              
      <b-card class="custom-card">
        <div class="text-center" v-if="!isLoggedId">         
        <b-button        
        variant="primary"
        @click="connectMetamask"  
        size="lg"      
        >Connect Metamask
        </b-button>         
        </div>
        <div class="d-flex" v-if="isLoggedId">
          <div>            
            <div>            
            <h5 class="text-left"><i class="fas fa-award"></i> Score: {{ score }}</h5>
            <h5 class="text-left"><i class="fa fa-gamepad"></i> Current Level: {{ level }}</h5>            
            </div>
            <div class="game-con">
            <b-button class="text-right" variant="primary" @click="start"
            >{{isStarted? 'Reset':'Start Playing'}}</b-button>            
            <step-progress            
            :steps="mySteps" 
            :current-step="currentStep" 
            active-color="purple"
            passive-color="grey"
            icon-class="fa fa-check"            
            :active-thickness="activethickness"
            :line-thickness="linethickness"
            :passive-thickness="passivethickness"
            ></step-progress>            
            <div class="row mt-4 ml-4">
              <div class="box" @mousemove="increaseScore">
                <span class="p-2">
                Move your cursor inside this box to play!
                </span>
              </div>
            </div>
            </div>            
            <div v-if="showImportBtn" class="mt-4 or-div">
            <p class="mt-">OR</p>
            <b-button variant="primary" @click="importScore">
              Import Score Credential</b-button
            >
            </div>
          </div>  
          <div class="profile-container ml-4 text-left" v-if="isLoggedId">
          <b-card class="text-center cardp">
            <h4><strong>Profile</strong></h4>
            <div class="text-left">  
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="display: flex; align-items: center;">
                <strong style="margin-right: 10px;">DID:</strong>
                <div class="d-flex align-items-center">
                  <span style="margin-right: 10px;">{{truncate1(didDoc.id, 30)}}</span>
                  <i class="fas fa-copy copy-icon" @click="copyToClipboard(didDoc.id,'DID')"></i>
                </div>
              </li>
              <li style="display: flex; align-items: center;">
                <strong style="margin-right: 10px;">EDV ID:</strong>
                <div class="d-flex align-items-center">
                  <span style="margin-right: 10px;">{{truncate1(`hs:edv:${didDoc.id}`, 30)}}</span>
                  <i class="fas fa-copy copy-icon" @click="copyToClipboard(`hs:edv:${didDoc.id}`,'EDV Id')"></i>
                </div>
              </li>
              <li style="display: flex; align-items: center;">
                <strong style="margin-right: 10px;">Controller:</strong>
                <div class="d-flex align-items-center">
                  <span style="margin-right: 10px;">{{truncate1(edvConfig.controller,25)}}</span>
                  <i class="fas fa-copy copy-icon" @click="copyToClipboard(edvConfig.controller,'Controller')"></i>
                </div>
              </li>
            </ul>
          <div class="text-center">
           <b-button    
           class="mt-2"    
              variant="primary"
              @click="disconnect"              
              >Disconnect
              </b-button>
              </div>
          </div>
          </b-card>
          </div>         
        </div>
      </b-card>
    </div>
     <hf-pop-up
      Id="level-cross-popup"
      Size="lg"
      :keepHeader="true"
    >
    <div class="text-center">
      <h2><strong>Congrats 🎉</strong></h2>          
      <div class="centered-alert mt-4">
        <b-alert v-if="isImported" variant="success" show class="custom-alert">
      <i class="fa fa-check"></i>
      Your Imported score is Verified
    </b-alert>
    <b-alert variant="success" show class="custom-alert">
      <i class="fa fa-check"></i>
      You have crossed level {{level}}. Score: {{score}}
    </b-alert>
    <div class="acc-cont" v-if="!showImportBtn">
      <b-button class="mt-2 btn" variant="primary"
      @click="acceptCredBtn">Accept</b-button>
      <small>Accept score and store in your vault</small>
    </div>        
</div>
  <b-button v-if="accpetCred" class="mt-2" variant="primary" @click="goToNext">Play Next Level</b-button>
        </div>
    </hf-pop-up>
  </div>
</template>

<script>
import { HypersignDID } from "hs-ssi-sdk";
import loadweb3 from "../utils/web3Instance";
import toast from "../utils/toast";
import multibase from "multibase";
import { Buffer } from "buffer";
import HfPopUp from "../elements/hfPopUp.vue";
import { 
  truncate
} from "../utils/hsConstants";
import StepProgress from 'vue-step-progress';
window.Buffer = Buffer;
import { mapActions, mapMutations, mapState } from "vuex"
export default {
  name: "VerifierPage",
  components: {StepProgress,HfPopUp },
  computed:{
    ...mapState({
      didDoc:state=>state.holderStore.didDoc,
      isLoggedId:state=>state.holderStore.isLoggedIn,
      edvConfig:state=>state.holderStore.edvConfig,
      edvClient:state=>state.holderStore.edvClient,
      hypersignVP:state=>state.holderStore.hypersignVp,
      showDecryptedCred:state=>state.holderStore.decryptedVc,
      did:state => state.holderStore.address
      })
  },
  data() {
    return {
      showImportBtn:true,
      isImported:false,
      accpetCred:false,
      mySteps:['Level 1','Level 2'],
      currentStep:0,
      linethickness:10,
      passivethickness:10,
      activethickness:10,
      vpResult: null,
      isStarted: false,    
      level: 0,
      score: 0,
      userPublicKeyMultibase: "",
      address: "",
      publicKeyMultibase: "",
      hypersignDID: null,
      fetchEncryptedCred: [],
      keyAgreementKeyPair: {},      
    };
  },
  async created(){
    await this.authenticateEntity()
  },
  mounted() {
    const namespace = "testnet";
    this.hypersignDID = new HypersignDID({ namespace });
    console.log(this.hypersignDID);
    this.initVpClass()
  },
  methods: {    
    ...mapActions('holderStore',['generateDIDDoc','initEdv','queryCredFromEdv','decryptVc','insertCredToEdv','preparePresentation','initVpClass']),
    ...mapActions('issuerStore',['authenticateEntity','issueCredential']),
    ...mapMutations('holderStore',['setLogginStatus']),
    copyToClipboard(id,content){
      if (id) {
        navigator.clipboard
          .writeText(JSON.stringify(id))
          .then(() => {
            this.toast(`${content} Copied to Clipboard`, "success");
          })
          .catch((err) => {
            window.alert("Error while copying", err);
          });
      }
    },
    goToNext(){      
      this.$root.$emit('bv::hide::modal', 'level-cross-popup') 
      this.accpetCred = false
      this.showImportBtn= false
    },
    async acceptCredBtn(){
      console.log(this.score)
      console.log(this.level)
      this.accpetCred = true      
      const vcFieldToSend = {        
        name:'raj',
        rollNo:20
      }
      console.log(vcFieldToSend)
      const issueCredResult = await this.issueCredential(vcFieldToSend)
      console.log(issueCredResult)
      if(issueCredResult!==null) {
        const storeToEdv = await this.insertCredToEdv(this.keyAgreementKeyPair)
        console.log(storeToEdv)
      }
    },
    disconnect(){
      this.$store.commit('holderStore/setLogginStatus',false)
      this.score = 0
      this.level = 0
      this.reset()
    },
    start() {
      if(this.isStarted){
        return this.reset()
      }
      this.isStarted = true;
    },
    async verify() {
      const params = {
        credential: this.showDecryptedCred,
        issuerDid: this.showDecryptedCred.issuer,
        verificationMethodId: this.showDecryptedCred.proof.verificationMethod,
      };
      console.log(params);
      const verificationResult = await this.hypersignVC.verify(params);
      console.log(verificationResult);
      return verificationResult;
    },
    reset() {
      this.score = 0;
      this.currentStep = 0;
      this.level = 0
      this.isImported=false
      this.isStarted = false
      this.accpetCred= false
      this.showImportBtn= true
    },
    increaseScore() {
      if(this.score>=200){
        return
      }
      if (this.isStarted) {
        if (this.score === 99) {          
          this.showImportBtn = false
          this.level = 1;
          this.currentStep = 1;
          this.$root.$emit("bv::show::modal", "level-cross-popup");
        }
        if (this.score === 199 ) {
          this.isImported = false
          this.showImportBtn = false          
          this.currentStep = 2;
          this.level +=1 
          this.$root.$emit("bv::show::modal", "level-cross-popup");
        }        
        this.score += 1;        
      }
    },
    async connectMetamask() {      
      const web3 = await loadweb3(1);
      window.web3 = web3;
      const accounts = await web3.eth.getAccounts();
      const acc = accounts[0]
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [acc],
      });
      console.log(publicKey)
      this.userPublicKeyMultibase = publicKey;
      this.address = accounts[0];
      const res = await this.generateDIDDoc(this.address)  
      await this.generateDiD()
      console.log(res)      
    },
    async fetchAllVcFn() {
      try {
        if (!this.didDoc) {
          throw new Error("Connect Metamask in DID tab");
        }
        const allVc = await this.edvClient.fetchAllDocs({
          edvId: `hs:edv:${this.didDoc.id}`,
        });
        this.fetchEncryptedCred = allVc;
      } catch (error) {
        this.toast(error, "error");
      }
    },
    async generateDiD() {
      const verificationMethod = {
        id: this.didDoc.id + "#" + `eip155:1:${this.address}`,
        type: "EcdsaSecp256k1RecoveryMethod2020",
        controller: this.didDoc.id,
        blockchainAccountId: `eip155:1:${this.address}`,
      };
      this.publicKeyMultibase = this.base64toMultibase58(
        this.userPublicKeyMultibase
      );
      this.keyAgreementKeyPair = {
        id: this.didDoc.id + "#" + this.publicKeyMultibase,
        type: "X25519KeyAgreementKeyEIP5630",
        controller: this.didDoc.id,
        publicKeyMultibase: this.publicKeyMultibase,
      };
      const payload = {
        url:'https://stage.hypermine.in/vault',
        keyAgreement: this.keyAgreementKeyPair,
        verificationMethod,
      }
      await this.initEdv(payload)
    },
    async importScore() {
      if(this.isImported){
        return this.toast('Score already imported','warning')
      }
      if (this.didDoc === null) {
        return this.toast("Connect Metamask", "error");
      }
      await this.queryCredFromEdv()
      const res = await this.decryptVc(this.keyAgreementKeyPair.id);
      const prepareVp = await this.preparePresentation()
      console.log(prepareVp)
      console.log(this.didDoc.verificationMethod[0].id)
      console.log(res.content.issuer + "#key-1")
      const result = await this.hypersignVP.verifyByClientSpec({
        signedPresentation: prepareVp,
        challenge: "1223121",
        domain: "www.hypersign.id",
        issuerDid: res.content.issuer,
        holderDid: this.didDoc.id,
        holderVerificationMethodId: this.didDoc.verificationMethod[0].id,
        issuerVerificationMethodId: res.content.issuer + "#key-1",
        web3Obj: window.web3,
      });
      console.log(result);
      this.vpResult = result;
      if (result.verified) {
        this.$root.$emit("bv::show::modal", "level-cross-popup");
        this.score = 0
        this.score += 100;
        this.currentStep = 1;
        this.isImported = true
        this.level=1  
        this.accpetCred = true     
      }
    },
    base64toMultibase58(base64) {
      const buffer = Buffer.from(base64, "base64");
      const base58 = multibase.encode("base58btc", buffer);
      return Buffer.from(base58).toString();
    },
    truncate1(str, number) {
    console.log(str,number)
      return truncate(str, number);
    },
  },  
  mixins: [toast],
};
</script>
<style scoped> 
.or-div{
  margin-left: 15rem;
}
.row {    
  height: 300px;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  width: 90%;
}
.game-con{
  margin-top:5rem;
  margin-left: 15rem;  
} 
.acc-cont b-button {
  width: 100px; /* Adjust the width as per your requirement */  
  color: rgba(86,52,105,1) 98%;
}
.acc-cont{
   display: flex;
  flex-direction: column;
  align-items: center; /* Center items horizontally */
  justify-content: center; /* Center items vertically */
  background: #42b983;
  width: 300px;
  height: 100px;
  border-radius: 5px;
}
.accept-container{ 
  display: flex;
  flex-direction: column;  
  width: 300px;
  height: 100px;
  background: grey;
  border-radius: 5px;
}
.centered-alert {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .custom-alert {
    width: 500px; /* Adjust the width as needed */
  }
.d-flex {
    display: flex;
    justify-content: space-between;
  }

  .profile-container {
    flex: 1;  
    max-height: 200px;      
  }
  .cardp{
    display: flex;
    float: right;
    width: 350px;  
    max-height: 200px;  
  }

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.didbox {
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
  flex: 1;
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
