<template>
  <div class="hello">
    <loading
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>
    <h1 :class="userProfile.isDarkMode?'changeColor':''">Game 1</h1>    
    <div class="container d-flex">
      <b-card class="custom-card" :style="isLoggedId ?'height:45rem;':''">
        <div class="text-center" v-if="!isLoggedId">
          <b-button class="hs-button" @click="connectMetamask" size="lg"
            >Connect Wallet
          </b-button>
        </div>
        <div class="d-flex" v-if="isLoggedId">
          <div>
            <div>
              <h5 class="text-left">
                <i class="fas fa-award"></i> Score: {{ score }}
              </h5>
              <h5 class="text-left">
                <i class="fa fa-gamepad"></i> Current Level: {{ level }}
              </h5>
            </div>
            <div class="game-con w-100">              
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
              <div class="rowBox mt-4 ml-4" @mousemove="increaseScore">
                <div class="box">
                  <span class="p-2">
                    Move your cursor inside this box to play!
                  </span>
                </div>
              </div>
            </div>            
            
            <div class="mt-4 or-div"> 
              <b-button class="text-right mr-4 hs-button" @click="start">
                <span v-if="!isStarted">
                  <i class="fa fa-play"></i>
                  Start Playing
                </span>
                <span v-else>
                  <i class="fa fa-stop"></i>
                  Stop
                </span>
              </b-button>                           
                 <b-button variant="link" class="ml-4 mt-2" @click="importScore()" v-if="showImportBtn" style="cursor:pointer">Import Game 2 Credential To Skip Level 1</b-button>
            </div>
          </div>
        </div>
      </b-card>
      <b-card class="ml-4" v-if="isLoggedId" style="max-height:45rem;">
      <b-card class="text-left cardp" v-if="isLoggedId">
        <div class="d-flex ml-2">
        <h4><strong>Profile</strong></h4>
        <div class="text-right">                    
          <i class="fa fa-cog mr-3 pr-icon"
          v-b-tooltip.hover.left
          title="Profile Settings"          
           @click="syncProfile"
          ></i>        
          <i class="fa fa-power-off pr-icon mr-1"
          v-b-tooltip.hover.right
          title="Disconnect"   
          @click="disconnect"
          ></i>        
        </div>
        </div>
        <div class="mt-2" style="float:left">
          <ul style="list-style: none; padding: 0; margin: 0">
            <li style="display: flex; align-items: center">
              <strong style="margin-right: 10px">User Handle:</strong>
              <div class="d-flex align-items-center">
                <a style="margin-right: 10px">{{
                  userProfile.handle ? userProfile.handle : '---'
                }}</a>
                <i v-if="userProfile.handle"
                  class="fas fa-copy copy-icon"
                  @click="copyToClipboard(userProfile.handle, 'Handle')"
                ></i>
              </div>
            </li>
            <li style="display: flex; align-items: center">
              <strong style="margin-right: 10px">Age Verified?:</strong>
              <div class="d-flex align-items-center">
                <a style="margin-right: 10px">{{
                  userProfile.isAboveLegalAge ? 'Yes' :'Not Yet'
                }}</a>
              </div>
            </li>
            <li style="display: flex; align-items: center">
              <strong style="margin-right: 10px">Theme:</strong>
              <div class="d-flex align-items-center">
                <a style="margin-right: 10px">{{
                  userProfile.isDarkMode ? 'dark' :'light'
                }}</a>              
              </div>
            </li>
            <li style="display: flex; align-items: center">
              <strong style="margin-right: 10px">DID:</strong>
              <div class="d-flex align-items-center">
                <a :href="`https://explorer.hypersign.id/hypersign-testnet/identity/${didDoc.id}`" target="_blank">{{
                  truncate1(didDoc.id, 30)
                }}</a>
                <i
                  class="fas fa-copy copy-icon ml-1 mb-2"
                  @click="copyToClipboard(didDoc.id, 'DID')"
                ></i>
              </div>
            </li>
            <li style="display: flex; align-items: center">
              <strong style="margin-right: 10px">Vault ID:</strong>
              <div class="d-flex align-items-center">
                <span>{{
                  truncate1(`hs:edv:${didDoc.id}`, 30)
                }}</span>
                <i
                  class="fas fa-copy copy-icon ml-1 mb-2"
                  @click="copyToClipboard(`hs:edv:${didDoc.id}`, 'Vault Id')"
                ></i>
              </div>
            </li>
          </ul>          

          <!-- <form>
            <div class="form-group row">
              <label for="inputEmail3" class="col-sm-3 col-form-label">User Handle</label>
              <div class="col-sm-9">
                <p placeholder="Email">{{userProfile.handle ? userProfile.handle : '---'}}</p>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputPassword3" class="col-sm-3 col-form-label">Password</label>
              <div class="col-sm-9">
                <input type="password" class="form-control" id="inputPassword3" placeholder="Password">
              </div>
            </div>
          </form> -->
        </div>
      </b-card>
      <hr>      
      <div class="mt-4 text-right">        
        <b-button                 
        @click="fetchAllVcFn()"
        class="hs-button"      
        ><i class="fa fa-sync mr-2"></i>Fetch Credentials</b-button>
      </div>      
      <div
      class="text-center"
      style="max-height: 24rem; overflow-y: auto;">
        <div
          class="mt-4 overlay"      
          v-for="(cred, index) in getAllEncryptedVc" :key="index"
          :id="'overlay-' + index" style="min-width: 350px; max-width: 350px;"
          :class="cred.encrypted === false ? 'flipped' : ''"
        >
            <b-card
            v-if="cred.encrypted === true"
              title="Credential"
              style="max-width:350px;"
              class="mb-2 cred-card overlay flip-card-front"
              @mouseover="activeOverlay(index)"
              @mouseleave="deactiveOverlay(index)">      
              <b-card-text>
                {{truncate1(cred.id,30)}}        
              </b-card-text>
              <div class="overlay-icon">
                <i class="fa fa-lock" :id="'lock-' + index" @mouseover="popLock(index)"
                  @mouseleave="popOutLock(index)"
                  @click="decryptCred(cred, index)" v-b-tooltip.hover.right
                  title="Decrypt Credential"
                ></i>     
              </div>
            </b-card>

            <!-- //////// -->
            <b-card
              v-if="cred.encrypted === false"
              :title="cred.credential.type[1].toUpperCase()"
              style="max-width:350px;"
              class="mb-2 unlocked"
              >      
              <b-card-text class="text-left" style="font-family:sans-serif; font-size:1.1rem">                
                Score: {{cred.credential.credentialSubject.score}}<br>
                Level: {{cred.credential.credentialSubject.level}}
              </b-card-text>
              <div class="eye-icon">
                <i class="fa fa-eye mr-4" :id="'lock-' + index" @mouseover="popLock(index)" 
                @mouseleave="popOutLock(index)"                 
                  @click="showDecryptedVc(cred.credential, index)" v-b-tooltip.hover.right
                  title="View Credential"
                ></i>     
              </div>
            </b-card>
        </div>
      </div>
      </b-card>
    </div>   
    <hf-pop-up Id="level-cross-popup" Size="lg" :keepHeader="true">
      <div class="text-center">
        <h2><strong>Congrats 🎉</strong></h2>
        <div class="centered-alert mt-4">
          <b-alert
            v-if="scoreFlags.scoreVerified"
            :variant="scoreFlags.scoreVerified? 'success':'secondary'"
            show
            class="custom-alert text-left"
          >
            {{scoreFlags.scoreVerified?'Your Imported score is Verified':' Verifying your Score Credential'}}
            <i class="fa fa-check" style="float:right;"></i>            
          </b-alert>
          <b-alert v-if="scoreFlags.isLevelCrossed" :variant="scoreFlags.isLevelCrossed ? 'success' :'secondary'" show class="custom-alert text-left">            
            You have crossed level {{ level }}. Score: {{ score }}
            <i class="fa fa-check mt-1" style="float:right;"></i>
          </b-alert>
          <b-alert v-if="scoreFlags.isLevelCrossed" :variant="scoreFlags.isCredentialAccepted ? 'success' : 'secondary'" show class="custom-alert text-left">            
            Accept this score and store in your vault  
            <i v-if="scoreFlags.isCredentialAccepted" class="fa fa-check mt-1" style="float:right;"></i>                    
          </b-alert>       
          <div class="acc-cont" v-if="scoreFlags.showAcceptCredBtn">
            <b-button class="mt-2 hs-button" @click="acceptCredBtn"
              >Accept</b-button
            >            
          </div>
        </div>
        <b-button
          v-if="scoreFlags.showNextLevelBtn"
          class="mt-2 hs-button"          
          @click="goToNext"
          >Play Next Level</b-button
        >
      </div>
    </hf-pop-up>
    <hf-pop-up Id="sing-in-pop-up" Size="lg" :keepHeader="true">
      <div class="text-center">
        <h2><strong>Setting Up Your Game <img  class="mt-2" src="../assets/loading.gif" height="12px" width="35px" alt="" srcset=""></strong></h2>
        <div class="centered-alert mt-4">
          <b-alert            
            :variant="instructionsCheck.isSelectedWallet?'success':'secondary'"
            show
            class="custom-alert text-left"
          >            
            Requesting Your Wallet Address                        
            <img v-if="!instructionsCheck.isSelectedWallet" style="float:right;" src="../assets/small-loader.gif" height="20px" width="20px" alt="" srcset="">
            <i class="fa fa-check mt-1" style="float:right;"            
            v-else
            ></i>            
          </b-alert>
         <b-alert            
            :variant="instructionsCheck.isAllowedPubKey?'success':'secondary'"
            show
            class="custom-alert text-left"
          >            
            Requesting Your Public Key
            <img v-if="instructionsCheck.isSelectedWallet && !instructionsCheck.isAllowedPubKey" style="float:right;" src="../assets/small-loader.gif" height="20px" width="20px" alt="" srcset="">
            <i class="fa fa-check" style="float:right;"
            v-if="instructionsCheck.isAllowedPubKey && instructionsCheck.isSelectedWallet"
            ></i>            
          </b-alert>
          <b-alert                     
            :variant="instructionsCheck.isDIDReg ? 'success':'secondary'"
            show
            class="custom-alert text-left"
          >            
            Checking Your DID On Chain
            <img v-if="instructionsCheck.isAllowedPubKey && !instructionsCheck.isDIDReg" style="float:right;" src="../assets/small-loader.gif" height="20px" width="20px" alt="" srcset="">
            <i class="fa fa-check" style="float:right;"
            v-if="instructionsCheck.isDIDReg && instructionsCheck.isAllowedPubKey"
            ></i>            
          </b-alert>
          <b-alert            
            :variant="instructionsCheck.isAllowedIndexing?'success':'secondary'"
            show
            class="custom-alert text-left"
          >            
            Allow Metamask For Indexing Your Vault
            <img v-if="!instructionsCheck.isAllowedIndexing && instructionsCheck.isDIDReg" style="float:right;" src="../assets/small-loader.gif" height="20px" width="20px" alt="" srcset="">
            <i class="fa fa-check" style="float:right;"
            v-if="instructionsCheck.isAllowedIndexing && instructionsCheck.isDIDReg"
            ></i>            
          </b-alert>
          <b-alert            
            :variant="instructionsCheck.isconnectedToEdv ? 'success':'secondary'"
            show
            class="custom-alert text-left"
          >            
            Requesting To Connect Your Vault
            <img v-if="!instructionsCheck.isAllowedIndexing && instructionsCheck.isDIDReg" style="float:right;" src="../assets/small-loader.gif" height="20px" width="20px" alt="" srcset="">
            <i class="fa fa-check" style="float:right;"
            v-if="instructionsCheck.isconnectedToEdv"
            ></i>            
          </b-alert>          
        </div>
      </div>
    </hf-pop-up>
    <hf-pop-up Id="decrypted-cred" Size="lg" :keepHeader="true">      
        <h2 class="text-center"><strong>Your Score Credential</strong></h2>
          <json-viewer
        :value="decryptedCredential"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>
    </hf-pop-up>
    <hf-pop-up Id="profile-form" Size="lg" :keepHeader="true">
      <div class="text-center" style="align-items: center"> 
        <h2><strong>Set Up Your Profile</strong></h2>     
        <div class="centered-profile mt-2 mb-4">          
          <div class="d-flex">
          <label class="mt-2">Your Game Handle: </label>          
          <input type="text" class="form-control w-50"
          placeholder="@handle"
          v-model="userProfile.handle"
          >    
          </div>         
          <div class="row w-50 mr-2">
            <div class="col-lg-9 col-md-9 text-left">
              <label for="endDate"
                  class="col-form-label">Are you above 18: </label>
            </div>
            <div class="col-lg-3 col-md-3 mt-2 text-right">
                <b-form-checkbox v-model="userProfile.isAboveLegalAge" name="check-button" switch>
                </b-form-checkbox>
            </div>
          </div>  
          <div class="row w-50 mr-2">
            <div class="col-lg-9 col-md-9 text-left">
              <label for="endDate"
                  class="col-form-label">Toggle for dark theme (default light):</label>
            </div>
            <div class="col-lg-3 col-md-3 mt-2 text-right">
                <b-form-checkbox v-model="userProfile.isDarkMode" @change="onToggleChange" name="check-button" switch>
                </b-form-checkbox>
            </div>
          </div>
          
          <div class="d-flex mt-2" style="align-items:center;">
            <b-button class="mt-2 mb-2 hs-button" @click="issueProfileCredential"
              >Save</b-button
            >                
            <b-button variant="link" class="ml-4" @click="syncExistingCred" style="cursor:pointer">Import Existing Setting From Vault</b-button>    
          </div>
        </div>               
      </div>
    </hf-pop-up>
  </div>
</template>

<script>
import loadweb3 from "../utils/web3Instance";
import toast from "../utils/toast";
import multibase from "multibase";
import { Buffer } from "buffer";
import HfPopUp from "../elements/hfPopUp.vue";
import { truncate,GAME1_SCORE_CRED,GAME1_PROFILE_CRED,GAME2_SCORE_CRED } from "../utils/hsConstants";
import StepProgress from "vue-step-progress";
window.Buffer = Buffer;
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
export default {
  name: "VerifierPage",
  components: { StepProgress, HfPopUp, Loading },
  computed: {
    ...mapState({
      didDoc: (state) => state.holderStore.didDoc,
      isLoggedId: (state) => state.holderStore.isLoggedIn,
      edvConfig: (state) => state.holderStore.edvConfig,
      edvClient: (state) => state.holderStore.edvClient,
      hypersignVP: (state) => state.holderStore.hypersignVp,
      showDecryptedCred: (state) => state.holderStore.decryptedVc,
      did: (state) => state.holderStore.address,
      credentialIdArr:(state)=> state.holderStore.credentialIdArr
    }),
    ...mapGetters("holderStore", ["getDIDDocJSONString","getAllEncryptedVc"]),
  },
  data() {
    return {            
      userProfile:{
        handle:'',
        isAboveLegalAge:false,
        isDarkMode:false
      },      
      instructionsCheck:{
        isSelectedWallet:false,
        isAllowedPubKey:false,
        isAllowedIndexing:false,
        isconnectedToEdv:false,
        isDIDReg:false
      },
      showDismissibleAlert:{status:false,text:""},
      isLoading: false,
      fullPage: true,
      showImportBtn: true,
      isImported: false,
      accpetCred: false,
      hideAcceptCredBtn:true,
      mySteps: ["Level 1", "Level 2"],
      currentStep: 0,
      linethickness: 10,
      passivethickness: 10,
      activethickness: 10,
      vpResult: null,
      isStarted: false,
      level: 0,
      score: 0,
      userPublicKeyMultibase: "",
      address: "",
      publicKeyMultibase: "",
      fetchEncryptedCred: [],
      keyAgreementKeyPair: {},
      decryptedCredential:null,
      overlayEffect:[],
      isDIDResolved:true,
      scoreFlags:{        
        showNextLevelBtn:false,
        showAcceptCredentialText:false, 
        scoreVerified:false,
        isLevelCrossed:false,    
        isCredentialAccepted:false,
        showAcceptCredBtn:false   
      }
    };
  },
  async created() {
    await this.authenticateEntity();
    this.initVpClass(); 
  },  
  methods: {
    ...mapActions("holderStore", [
      "generateDIDDoc",
      "initEdv",
      "queryCredFromEdv",
      "decryptVc",
      "insertCredToEdv",
      "preparePresentation",
      "initVpClass",
      "queryGame2Credential",
      "queryPlayerProfile",
      "addCredToDecryptedArray"
    ]),
    ...mapActions("issuerStore", [
      "authenticateEntity",
      "issueCredential",
      "registerDID",
      "resolveDID",
    ]),
    ...mapMutations("holderStore", ["setLogginStatus","addCredToStore"]),
    onToggleChange() {
      this.$emit('toggle-change', this.userProfile.isDarkMode);
    },
    activeOverlay(idx) {
            this.overlayEffect[idx] = true
            if (document.getElementById(`overlay-${idx}`) === null) {
                return
            } document.getElementById(`overlay-${idx}`).classList.add('show-overlay')

        },
        deactiveOverlay(idx) {
            this.overlayEffect[idx] = false
            if (document.getElementById(`overlay-${idx}`) === null) {
                return
            }
            document.getElementById(`overlay-${idx}`).classList.remove('show-overlay')
        },
        popLock(id) {
          document.getElementById(`lock-${id}`).classList.add('overlay-icon-pop')
        },
        popOutLock(id) {
          document.getElementById(`lock-${id}`).classList.remove('overlay-icon-pop')
        },
    copyToClipboard(id, content) {
      if (id) {
        navigator.clipboard
          .writeText(id)
          .then(() => {
            this.toast(`${content} Copied to Clipboard`, "success");
          })
          .catch((err) => {
            window.alert("Error while copying", err);
          });
      }
    },
    async issueProfileCredential(){      
      this.isLoading = true
      try {
        const dataToSend={
          isUserProfile:true,
          cred:this.userProfile,
          schemaId:GAME1_PROFILE_CRED
        }
        const res = await this.issueCredential(dataToSend)
        const credToEdv ={
          keyAgreementKeyPair:this.keyAgreementKeyPair,
          issuedCredential: res.credentialDocument
        }
        const storeToEdv = await this.insertCredToEdv(credToEdv);
        if (storeToEdv.message === "document created") {
          this.toast("Credential Stored In Vault Successully", "success");
          this.userProfile = storeToEdv
        }       
        const profile = res.credentialDocument.credentialSubject
        this.userProfile.handle = profile.handle
        this.userProfile.isDarkMode = profile.isDarkMode
        this.userProfile.isAboveLegalAge = profile.isAboveLegalAge
      } catch (error) {
        this.toast(error,'error')
      } finally {
        this.isLoading = false        
        this.$root.$emit("bv::hide::modal", "profile-form");
      }
    },    
    syncProfile(){
      this.$root.$emit("bv::show::modal", "profile-form");

    },
    goToNext() {
      this.$root.$emit("bv::hide::modal", "level-cross-popup");
      this.scoreFlags.showNextLevelBtn = false
      this.scoreFlags.showAcceptCredentialText = false
    },
    async acceptCredBtn() {
      this.isLoading = true
      try {
        const cred ={
          score:this.score,
          level:this.level
        }
        const vcFieldToSend = {
        isUserProfile:false,
        cred,
        schemaId:GAME1_SCORE_CRED
      };
      const issueCredResult = await this.issueCredential(vcFieldToSend);
      if (issueCredResult !== null) {
        const dataToSend = {          
          keyAgreementKeyPair:this.keyAgreementKeyPair,
          issuedCredential: issueCredResult.credentialDocument
        }
        const storeToEdv = await this.insertCredToEdv(dataToSend);
        if (storeToEdv.message === "document created") {
          this.toast("Score Stored In Vault Successully", "success");
          this.accpetCred = this.level === 1 ? true : false;
          this.scoreFlags.isCredentialAccepted = true
          this.scoreFlags.showAcceptCredBtn = false
          this.scoreFlags.showNextLevelBtn = this.level === 1 ? true :false
        }
      }
      } catch (error) {
        this.toast(error,'error')
      }
      finally{
        this.isLoading = false
      }
      
    },
    disconnect() {
      this.$store.commit("holderStore/setLogginStatus", false);
      this.score = 0;
      this.level = 0;
      this.reset();
      this.onToggleChange()
    },
    start() {
      if (this.isStarted) {
        return this.reset();
      }
      this.isStarted = true;
      this.showImportBtn = false
    },
    async verify() {
      const params = {
        credential: this.showDecryptedCred,
        issuerDid: this.showDecryptedCred.issuer,
        verificationMethodId: this.showDecryptedCred.proof.verificationMethod,
      };
      const verificationResult = await this.hypersignVC.verify(params);
      return verificationResult;
    },
    reset() {
      this.score = 0;
      this.currentStep = 0;
      this.level = 0;
      this.isImported = false;
      this.isStarted = false;
      this.accpetCred = false;
      this.showImportBtn = true;
      this.isLoading = false
      this.instructionsCheck ={
        isSelectedWallet:false,
        isAllowedPubKey:false,
        isAllowedIndexing:false,
        isconnectedToEdv:false,
        isDIDReg:false
      },
      this.userProfile={
        handle:'',
        isAboveLegalAge:'',
        isDarkMode:''
      },
       this.scoreFlags = {
        showNextLevelBtn:false,
        showAcceptCredentialText:false, 
        scoreVerified:false,
        isLevelCrossed:false,    
        isCredentialAccepted:false,
        showAcceptCredBtn:false
      }
    },
    increaseScore() {
      if (this.score >= 200) {
        return;
      }
      if(this.score>100 && this.score<=200){
        this.scoreFlags.scoreVerified=false
        this.scoreFlags.showAcceptCredentialText = false
        this.scoreFlags.isCredentialAccepted = false
        this.scoreFlags.showAcceptCredBtn = true
      }
      if (this.isStarted) {
        if (this.score === 99) {
          this.scoreFlags.showAcceptCredBtn = true
          this.showImportBtn = false;
          this.scoreFlags.isLevelCrossed = true
          this.scoreFlags.showAcceptCredentialText = true          
          this.level = 1;
          this.currentStep = 1;
          this.$root.$emit("bv::show::modal", "level-cross-popup");
        }
        if (this.score === 199) {
          this.isImported = false;
          this.showImportBtn = false;
          this.scoreFlags.isLevelCrossed = true
          this.scoreFlags.showAcceptCredentialText = true
          this.currentStep = 2;
          this.level += 1;
          this.$root.$emit("bv::show::modal", "level-cross-popup");
        }
        this.score += 1;
      }
    },
    async decryptCred(cred,id){      
      this.isLoading = true
      try {
        if(this.address===""){
          throw new Error('Connect Metamask')
        }
      const dataToQuery = {
          encData:cred.credential.encryptedData,
          keyAgreementKeyPairId:this.keyAgreementKeyPair.id
        }
        const res = await this.decryptVc(dataToQuery);        
        await this.addCredToDecryptedArray({index:id, credential:{encrypted:false,credential:res.content}})        
      } catch (error) {
        this.toast(error,'error')
      }
      finally{
        this.isLoading = false
      }
    },
    showDecryptedVc(vc){
      this.decryptedCredential = null
      this.decryptedCredential=vc
      this.$root.$emit("bv::show::modal", "decrypted-cred");
    },
    async connectMetamask() {   
      this.reset()
      this.$root.$emit("bv::show::modal", "sing-in-pop-up");            
      try {
        const web3 = await loadweb3(1);
        window.web3 = web3;
        const accounts = await web3.eth.getAccounts();
        const acc = accounts[0];
        this.instructionsCheck.isSelectedWallet = true        
        const publicKey = await window.ethereum.request({
          method: "eth_getEncryptionPublicKey",
          params: [acc],
        });    
        this.userPublicKeyMultibase = publicKey;
        this.instructionsCheck.isAllowedPubKey = true
        this.address = accounts[0];
        const didId = `did:hid:testnet:${this.address}`;
        const resolveResult = await this.resolveDID(didId);
        const res = await this.generateDIDDoc(this.address);
        console.log(res);
        if (resolveResult.didDocumentMetadata === null) {
          this.isDIDResolved=false
          const signature = await window.web3.eth.personal.sign(
            this.getDIDDocJSONString,
            this.address
          );
          const payload = {
            signature,
            address: this.address,
          };
          const regDID = await this.registerDID(payload);
          console.log(regDID);  
          this.instructionsCheck.isDIDReg=true        
        }else{
          this.instructionsCheck.isDIDReg = true
        }
        await this.connectEDV();
      } catch (error) {
        this.toast(error.message, "error");
      } finally {
        this.isLoading = false;        
      }
    },
    async fetchAllVcFn() {
      this.isLoading = true
      try {
        if (!this.isLoggedId) {
          throw new Error("Connect Metamask");
        }
        const allVc = await this.queryCredFromEdv({
          edvId: `hs:edv:${this.didDoc.id}`,
          id:GAME1_SCORE_CRED
        });
        if(!allVc.length){
          throw new Error('No Credential Found issued by this game')
        }
        this.fetchEncryptedCred = allVc;
        this.fetchEncryptedCred.forEach((item)=>{
          const credentialid = item.id.replace('hs:credentials:', '')
          if(this.credentialIdArr.includes(credentialid)){
            return
          }
          this.$store.commit("holderStore/addCredToStore",{encrypted:true,credential:item})          
        })
        this.overlayEffect = new Array(this.fetchEncryptedCred.length).fill(false)
      } catch (error) {
        this.toast(error, "error");
      }
      finally{
        this.isLoading=false
      }
    },
    async syncExistingCred(){      
      this.isLoading = true
      try {
        const playerProfile = await this.queryPlayerProfile({
          edvId: `hs:edv:${this.didDoc.id}`,
          id:GAME1_PROFILE_CRED
        })        
        if(!playerProfile.length){         
          this.$root.$emit("bv::show::modal", "profile-form");
          this.toast('No Profile Credential found','error')
        }else{
          const dataToQuery = {
          encData:playerProfile[0].encryptedData,
          keyAgreementKeyPairId:this.keyAgreementKeyPair.id
        }
        const res = await this.decryptVc(dataToQuery);           
        const profile = res.content.credentialSubject
        this.userProfile.handle = profile.handle
        this.userProfile.isDarkMode = profile.isDarkMode
        this.userProfile.isAboveLegalAge = profile.isAboveLegalAge 
        this.onToggleChange()
        }
      } catch (error) {
        this.toast(error,'error')
      } finally {
        this.isLoading = false
        this.$root.$emit("bv::hide::modal", "profile-form");
      }
    },
    async connectEDV() {
      try {
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
          url: "https://stage.hypermine.in/vault",
          keyAgreement: this.keyAgreementKeyPair,
          verificationMethod,
        };
        const edvint = await this.initEdv(payload);
        console.log(edvint)
        this.instructionsCheck.isAllowedIndexing = true;       
        this.instructionsCheck.isconnectedToEdv = true;
      } catch (error) {
        this.toast(error, "error");
      } finally {
        this.isLoading = false;
        this.$root.$emit("bv::hide::modal", "sing-in-pop-up");
        this.isDIDResolved = true
      }
    },
    async importScore() {
      this.isLoading = true;
      try {
        if (this.isImported) {
          return this.toast("Score already imported", "warning");
        }
        if (this.didDoc === null) {
          return this.toast("Connect Metamask", "error");
        }
        const queryEdv = await this.queryGame2Credential({
          edvId: `hs:edv:${this.didDoc.id}`,
          id:GAME2_SCORE_CRED
        });
        if(!queryEdv.length){
          throw new Error('No Game 2 Credential found')
        }
        const dataToQuery = {
          encData:queryEdv[0].encryptedData,
          keyAgreementKeyPairId:this.keyAgreementKeyPair.id
        }
        const res = await this.decryptVc(dataToQuery);
        const prepareVp = await this.preparePresentation();
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
        this.vpResult = result;
        if (result.verified) {
          this.$root.$emit("bv::show::modal", "level-cross-popup");
          this.score = 0;
          this.score += 100;
          this.currentStep = 1;
          this.isImported = true;
          this.level = 1;
          this.scoreFlags.scoreVerified = true
          this.scoreFlags.isLevelCrossed=true
          this.scoreFlags.showAcceptCredentialText = false 
          this.scoreFlags.showAcceptCredBtn = true 
        }
      } catch (error) {
        this.toast(error.message, "error");
      } finally {
        this.isLoading = false;
      }
    },
    base64toMultibase58(base64) {
      const buffer = Buffer.from(base64, "base64");
      const base58 = multibase.encode("base58btc", buffer);
      return Buffer.from(base58).toString();
    },
    truncate1(str, number) {
      return truncate(str, number);
    },
  },
  mixins: [toast],
};
</script>
<style scoped>
.changeColor{
  color:white
}
.pr-icon{
  cursor: pointer;
  font-size: 1.5rem;
}
.hs-button{  
  border-radius: 5px;
  background: -webkit-linear-gradient(140deg, #8653a4, #1b1927);  
}
.show-overlay {
    z-index: 999;
    background-color: #f85a5a75 !important;
    transition: .5s ease !important;
}
.overlay-icon i {
    cursor: pointer;
    float: right;
    width: 66px;
    font-size: 5rem;
    background-repeat: no-repeat;
    opacity: 0.2;
}
.eye-icon i{
  cursor: pointer;
  float: right;
  width: 20px;
  font-size: 2rem;
  background-repeat: no-repeat;
  opacity: 0.2;
}
.overlay-icon-pop {
    cursor: pointer;
    float: right;        
    font-size: 5rem;
    color: red;
    background-repeat: no-repeat;
    opacity: 0.2;
    background-size: 187px;
    animation: shake 0.5s infinite !important;
}

.overlay {
    /* background: rgba(0,0,0,0.3)!important; */
    z-index: 999;
    background: linear-gradient(140deg, #5c5b5e31, #1b19279a) !important;
    transition: .5s ease !important;
    border-radius: 14px;


}
.cred-card {
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.2);
    font-family: 'IBM Plex Sans', Arial, sans-serif;    
    background: -webkit-linear-gradient(140deg, #8653a4, #1b1927);    
    border-radius: 14px;
    margin-top: 7%;
    text-align: left;
    font-size: 13px;
    font-family: bold;
    color: white;
    border:none;
}
.unlocked {
    box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.2);
    font-family: 'IBM Plex Sans', Arial, sans-serif;    
    background: -webkit-linear-gradient(140deg, #8653a4, #1b1927);    
    border-radius: 14px;
    margin-top: 7%;
    text-align: left;
    font-size: 13px;
    color: white;
    border:none;
}
.or-div {
  margin-left: 7rem;
}
.rowBox {
  cursor: pointer;
  height: 300px;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  width: 90%;
}
.game-con {
  margin-left: 1.7rem;
}
.acc-cont b-button {
  width: 100px; /* Adjust the width as per your requirement */
  color: rgba(86, 52, 105, 1) 98%;
}
.acc-cont {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center items horizontally */
  justify-content: center; /* Center items vertically */  
}
.accept-container {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100px;
  background: grey;
  border-radius: 5px;
}
.container{
  max-height: 100rem;
}
.centered-alert {  
  display: flex;
  flex-direction: column;
  align-items: center;
}
.centered-profile{
  display: flex;
  flex-direction: column;
  align-items: center;    
  padding: 1rem;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
}
.custom-alert {
  width: 500px; /* Adjust the width as needed */
}
.d-flex {
  display: flex;
  justify-content: space-between;
}

.profile-container {
  max-height: 200px;
}
.cardp {        
  width: 350px;
  max-height: 220px;
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
