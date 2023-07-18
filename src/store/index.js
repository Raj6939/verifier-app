import Vue from 'vue';
import Vuex from 'vuex';
import issuerStore from './issuer';
import verifierStore from './verifier';
import holderStore from './holder'
Vue.use(Vuex)

export default new Vuex.Store({
    modules: {     
        issuerStore,
        verifierStore,
        holderStore
    }
})

