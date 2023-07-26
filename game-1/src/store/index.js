import Vue from 'vue';
import Vuex from 'vuex';
import issuerStore from './issuerStore';
import verifierStore from './verifierStore';
import holderStore from './holderStore'
Vue.use(Vuex)

export default new Vuex.Store({
    modules: {     
        issuerStore,
        verifierStore,
        holderStore
    }
})

