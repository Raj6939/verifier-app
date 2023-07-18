import { HypersignVerifiablePresentation } from "hs-ssi-sdk";
import {
    HIDNODE_NAMESPACE,
    HIDNODE_REST,
    HIDNODE_RPC,    
  } from "../utils/hsConstants";
const verifierStore ={
    namespaced: true,
    state: {
        vpResult:null,        
        hypersignVp:null
    },
    getters: {
        getAddress(state){
            return state.address
        }
    },
    mutations: {
        initVpClass(state,payload){
            state.hypersignVp = payload
        }
    },
    actions: {
        initVpClass({commit}){
            const vp = new HypersignVerifiablePresentation({
                nodeRestEndpoint: HIDNODE_REST,
                nodeRpcEndpoint: HIDNODE_RPC,
                namespace: HIDNODE_NAMESPACE,
              });
            commit('initVpClass',vp)
        }
    }
}

export default verifierStore;