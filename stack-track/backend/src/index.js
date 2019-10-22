import logMessage from './js/logger.js'
import './css/style.css'
import TestRunner from 'jest-runner'
// Log message to console
logMessage('A very warm welcome to Expack!')
// Needed for Hot Module Replacement
if (typeof (module.hot) !== 'undefined') {
    module.hot.accept() // eslint-disable-line no-undef  
}

logMessage(TestRunner)