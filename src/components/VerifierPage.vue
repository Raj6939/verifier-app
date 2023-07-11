<template>
  <div class="hello">
    <h1>Hi I am Verifier</h1>
    <p>Click here to Verify your College Cred</p>
    <textarea cols="30" rows="10" v-model="credInput"></textarea>
    <br>    
    <button @click="preparePresentation">Prepare & Sign Presentation(Sign by Holder)</button><br>
    <button @click="verifyVP">Verify Presentation Template</button>
  </div>
</template>

<script>
import {HypersignVerifiablePresentation} from "hs-ssi-sdk"
export default {
  name: 'VerifierPage',
  data(){
    return{
      credInput:null,
      privateKey:""
    }
  },
  methods:{
   async preparePresentation(){
    const hypersignVP = new HypersignVerifiablePresentation({
    nodeRestEndpoint: 'https://api.jagrat.hypersign.id',
    nodeRpcEndpoint: 'https://rpc.jagrat.hypersign.id',
    namespace: 'testnet',
    });      
    console.log(hypersignVP)
    const params ={
      "verifiableCredentials":[this.credInput],
      "holderDid":"did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC"
    }
    console.log(params)

  const unsignedverifiablePresentation = await hypersignVP.generate(params);
  console.log(unsignedverifiablePresentation)
  const paramsForSign = {
          presentation: unsignedverifiablePresentation,
          holderDid: "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
          verificationMethodId:"did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC#key-1",
          privateKeyMultibase:this.privateKey,
          challenge:"12112121",
    }
const signedVerifiablePresentation = await hypersignVP.sign(paramsForSign);
console.log(signedVerifiablePresentation)
    },
    verifyVP(){}
  }
}
</script>
<style scoped>
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
