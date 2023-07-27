import { HypersignEdvClientEcdsaSecp256k1 } from "@hypersign-protocol/hypersign-vault-client";
import { HypersignVerifiablePresentation } from "hs-ssi-sdk";
import { HypersignDID } from "hs-ssi-sdk";
import {
  HIDNODE_NAMESPACE,
  HIDNODE_REST,
  HIDNODE_RPC,
} from "../utils/hsConstants";
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex)
// NOTE: Since Metamask signs the symmetric primitive data types like string,interger and array of symmetric premitive type,
// we need to convert didDoc(jsonld) to json stringified

function ldToJsonConvertor(ld) {
  const json = {};
  for (const key in ld) {
    if (key === "@context") {
      json["context"] = ld[key];
      // } else if (ld[key] === "" || (Array.isArray(ld[key]) && ld[key].length === 0)) {
      //     json[key] = undefined;
    } else {
      json[key] = ld[key];
    }
  }
  return json;
}
const holderStore = {
  namespaced: true,
  state: {
    hypersignVp: null,
    address: "",
    didDoc: null,
    edvClient: null,
    edvConfig: null,
    isLoggedIn: false,
    encryptedVc: [],
    decryptedVc: null,
    signedVp: null,
    game2EncryptedVc:[],
    userProfile:[],
    credentialIdArr:[]
  },
  getters: {
    getUserProfile(state){
      if(state.userProfile.length){
        return state.userProfile
      }      
    },
    getGame2EncryptedVc(state){
      if(state.game2EncryptedVc.length){
        return state.game2EncryptedVc
      }
    },
    getAllEncryptedVc(state){
      if(state.encryptedVc!==null){
        return state.encryptedVc
      }
    },
    getDidDocId(state) {
      if (state.didDoc !== null) {
        return state.didDoc.id;
      }
    },
    getVerificationMethodId(state) {
      if (state.didDoc !== null) {
        return state.didDoc.verificationMethod[0].id;
      }
    },
    getDIDoc(state) {
      if (state.didDoc !== null) {
        return state.didDoc;
      }
    },
    getDIDDocJSONString: (state) => {
      return JSON.stringify(ldToJsonConvertor(state.didDoc), (key, value) => {
        if (value === "" || (Array.isArray(value) && value.length === 0)) {
          return undefined;
        }
        return value;
      });
    },
  },
  mutations: {    
    addCredToStore(state,payload) {
      state.encryptedVc.push(payload)
    },
    updateStore(state, payload) {
      state.address = payload;
    },
    setDIDDoc(state, payload) {
      state.didDoc = payload;
    },
    setLogginStatus(state, payload) {
      if (!payload) {
        state.didDoc = null,
        state.edvClient = null,
        state.edvConfig = null,
        state.encryptedVc= [],
        state.decryptedVc= null,
        state.signedVp= null,
        state.game2EncryptedVc=[],
        state.credentialIdArr=[]
      }
      state.isLoggedIn = payload;
    },
    setEdvClient(state, payload) {
      state.edvClient = payload;
    },
    setEdvConfig(state, payload) {
      state.edvConfig = payload;
    },
    setEncryptedVc(state, payload) {
      state.encryptedVc = payload;
    },
    setEncryptedVcForGame2(state,payload) {
      state.game2EncryptedVc = payload
    },
    setDecryptedVc(state, payload) {
      state.decryptedVc = payload;
    },
    initVpClass(state, payload) {
      state.hypersignVp = payload;
    },
    setSignedVp(state, payload) {
      state.signedVp = payload;
    },
    setUserProfile(state,payload) {
      state.userProfile = payload
    },
    addCredentialsToStoreIndexSorted(state, payload) {      
      Vue.set(state.encryptedVc, payload.index, payload.credential)
    },
    addTOIndexArray(state, payload) {    
      state.credentialIdArr.push(payload)
    },
  },
  actions: {
    initVpClass({ commit }) {
      const vp = new HypersignVerifiablePresentation({
        nodeRestEndpoint: HIDNODE_REST,
        nodeRpcEndpoint: HIDNODE_RPC,
        namespace: HIDNODE_NAMESPACE,
      });
      commit("initVpClass", vp);
    },
    generateDIDDoc: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        try {
          const hypersignDid = new HypersignDID({
            namespace: HIDNODE_NAMESPACE,
          });
          const params = {
            methodSpecificId: payload,
            chainId: "0x1",
            clientSpec: "eth-personalSign",
            address: payload,
          };
          hypersignDid.createByClientSpec(params).then((resp) => {            
            commit("setDIDDoc", resp);
            resolve(resp);
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    initEdv: ({ state, commit }, payload) => {
      return new Promise((resolve, reject) => {
        try {
          const edvClient = new HypersignEdvClientEcdsaSecp256k1({
            url: payload.url,
            keyAgreement: payload.keyAgreement,
            verificationMethod: payload.verificationMethod,
          });
          const config = {
            edvId: `hs:edv:${state.didDoc.id}`,
            verificationMethod: payload.verificationMethod,
            keyAgreement: payload.keyAgreement,
          };
          edvClient.registerEdv(config).then((data) => {            
            state.edvConfig = data;
            commit("setLogginStatus", true);
            commit("setEdvClient", edvClient);
            commit("setEdvConfig", data);
            resolve(data);
          });
        } catch (error) {          
          reject(error);
        }
      });
    },
    queryPlayerProfile: ({state,commit},payload) => {
      return new Promise((resolve,reject) => {
        try {
          state.edvClient
          .Query({
            edvId: payload.edvId,
            equals: [
              {
                "content.credentialSchema.id":
                  payload.id,
              },
            ],
          })
          .then((data) => {            
            commit("setUserProfile",data)
            resolve(data)
          })
        } catch (error) {
          reject(error);
        }
      })
    },    
    queryGame2Credential:({state,commit},payload) =>{      
      return new Promise((resolve, reject) => {
        try {
          state.edvClient
            .Query({
              edvId: payload.edvId,
              equals: [
                {
                  "content.credentialSchema.id":
                    payload.id,
                },
              ],
            })
            .then((data) => {
              commit("setEncryptedVcForGame2", data);
              resolve(data);
            });
        } catch (error) {
          reject(error);
        }
      });
    },
    queryCredFromEdv: ({ state },payload) => {
      return new Promise((resolve, reject) => {
        try {
          state.edvClient
            .Query({
              edvId: payload.edvId,
              equals: [
                {
                  "content.credentialSchema.id":
                    payload.id,
                },
              ],
            })
            .then((data) => {              
              resolve(data);
            });
        } catch (error) {
          reject(error);
        }
      });
    },
    decryptVc: ({ state, commit }, payload) => {
      return new Promise((resolve, reject) => {
        try {
          state.edvClient
            .decryptDocument({
              encryptedDocument: payload.encData,
              recipient: {
                id: payload.keyAgreementKeyPairId,
                type: "X25519KeyAgreementKeyEIP5630",
              },
            })
            .then((data) => {
              commit("setDecryptedVc", data.content);
              resolve(data);
            });
        } catch (error) {
          reject(error);
        }
      });
    },
    addCredToDecryptedArray: ({commit},payload) => {      
      commit('addTOIndexArray',payload.credential.credential.id)
      commit('addCredentialsToStoreIndexSorted', payload)

    },
    insertCredToEdv: ({ state }, payload) => {            
      return new Promise((resolve, reject) => {
        try {
          const dataToAddEdv = {
            content: payload.issuedCredential,
          };
          const did = state.didDoc.id;
          state.edvClient
            .insertDoc({
              document: dataToAddEdv,
              edvId: `hs:edv:${did}`,
              recipients: [
                {
                  id:
                    state.didDoc.id.split("#")[0] +
                    "#" +
                    payload.keyAgreementKeyPair.publicKeyMultibase,
                  type: "X25519KeyAgreementKeyEIP5630",
                },
              ],
              indexs: [
                {
                  index: "content.credentialSchema.id",
                  unique: false,
                },
              ],
            })
            .then((data) => {
              resolve(data);
            });
        } catch (error) {
          reject(error);
        }
      });
    },
    preparePresentation: ({ state, getters, commit }) => {
      return new Promise((resolve, reject) => {
        try {
          state.hypersignVp
            .generate({
              verifiableCredentials: [state.decryptedVc],
              holderDid: getters.getDidDocId,
            })
            .then((data) => {
              state.hypersignVp
                .signByClientSpec({
                  presentation: data,
                  holderDid: getters.getDidDocId,
                  verificationMethodId: getters.getVerificationMethodId,
                  web3Obj: window.web3,
                  challenge: "1223121",
                  domain: "www.hypersign.id",
                })
                .then((res) => {
                  commit("setSignedVp", res);
                  resolve(res);
                })
                .catch((error) => {
                  reject(error);
                });
            });
        } catch (error) {
          reject(error);
        }
      });
    },
  },
};

export default holderStore;
